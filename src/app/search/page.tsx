"use client";

import { useEffect, useMemo, useState } from 'react';

type StudyItem = {
  id: number;
  title: string;
  modality: string;
  tags: string[];
  date: string;
  studyDate: string;
  studyTime: string;
  accessionNumber: string;
  studyId: string;
  studyInstance: string;
  requestingPhysician: string;
  referringPhysicianName: string;
  institutionName: string;
  patientId: string;
  patientName: string;
  patientBirthDate: string;
  patientSex: string;
  patientOtherIds: string;
  notes: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [selectedFilters, setSelectedFilters] = useState({ xray: false, ct: false, cr: false, date: false });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [items, setItems] = useState<StudyItem[]>([]);
  const [activeItem, setActiveItem] = useState<StudyItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type PatientInfo = {
    id?: number;
    patientId?: string;
    patientName?: string;
    sex?: string;
    birthDate?: string;
    age?: string;
  };

  const normalizeStudyItem = (item: Record<string, unknown>, index: number): StudyItem => {
    const raw = item;
    const getValue = (key: string) => raw[key as keyof typeof raw];

    const id = Number(getValue('id') ?? 0);
    const modalityValue = getValue('modality');
    const studyDateValue = getValue('studyDate');
    const dateValue = getValue('date');

    const tagsValue = getValue('tags');
    const tags = Array.isArray(tagsValue)
      ? tagsValue.map(String)
      : typeof modalityValue === 'string' && modalityValue
      ? [modalityValue]
      : [];

    const titleValue = String(getValue('studyDescription') ?? getValue('title') ?? '').trim();

    return {
      id,
      title: titleValue || `의료영상${index + 1}`,
      modality: String(modalityValue ?? ''),
      tags,
      date: String(studyDateValue ?? dateValue ?? ''),
      studyDate: String(studyDateValue ?? dateValue ?? ''),
      studyTime: String(getValue('studyTime') ?? getValue('study_time') ?? ''),
      accessionNumber: String(getValue('accessionNumber') ?? getValue('accession_number') ?? ''),
      studyId: String(getValue('studyId') ?? getValue('study_instance_uid') ?? getValue('studyInstanceUid') ?? ''),
      studyInstance: String(getValue('studyInstance') ?? getValue('study_instance') ?? ''),
      requestingPhysician: String(getValue('requestingPhysician') ?? getValue('requesting_physician') ?? ''),
      referringPhysicianName: String(getValue('referringPhysicianName') ?? getValue('referring_physician_name') ?? ''),
      institutionName: String(getValue('institutionName') ?? getValue('institution_name') ?? ''),
      patientId: String(getValue('patientId') ?? getValue('patient_id') ?? ''),
      patientName: String(getValue('patientName') ?? getValue('patient_name') ?? ''),
      patientBirthDate: String(getValue('patientBirthDate') ?? getValue('patient_birth_date') ?? ''),
      patientSex: String(getValue('patientSex') ?? getValue('patient_sex') ?? ''),
      patientOtherIds: String(getValue('patientOtherIds') ?? getValue('patient_other_ids') ?? ''),
      notes: String(getValue('notes') ?? getValue('description') ?? getValue('studyDescription') ?? ''),
    };
  };

  const fetchPatientInfo = async (patientId: string): Promise<PatientInfo | null> => {
    if (!patientId) {
      return null;
    }

    const response = await fetch(`/api/patients/${encodeURIComponent(patientId)}`, { cache: 'no-store' });
    if (!response.ok) {
      console.error('환자정보 조회 실패', response.statusText);
      return null;
    }

    return (await response.json()) as PatientInfo;
  };

  const enrichItemsWithPatientInfo = async (studyItems: StudyItem[]): Promise<StudyItem[]> => {
    const patientIds = [...new Set(studyItems.map(item => item.patientId).filter(Boolean))];
    if (patientIds.length === 0) {
      return studyItems;
    }

    const patientInfoEntries = await Promise.all(
      patientIds.map(async patientId => {
        const info = await fetchPatientInfo(patientId);
        return [patientId, info] as const;
      }),
    );

    const patientInfoMap = new Map(
      patientInfoEntries.filter((entry): entry is [string, PatientInfo] => entry[1] !== null),
    );

    return studyItems.map(item => {
      const patientInfo = patientInfoMap.get(item.patientId);
      if (!patientInfo) {
        return item;
      }

      return {
        ...item,
        patientName: patientInfo.patientName || item.patientName,
        patientSex: patientInfo.sex || item.patientSex,
        patientBirthDate: patientInfo.birthDate || item.patientBirthDate,
      };
    });
  };

  const handleSelectItem = async (item: StudyItem) => {
    setActiveItem(item);

    if (!item.patientId) {
      return;
    }

    const patientInfo = await fetchPatientInfo(item.patientId);
    if (!patientInfo) {
      return;
    }

    setActiveItem(prev =>
      prev
        ? {
            ...prev,
            patientName: patientInfo.patientName || prev.patientName,
            patientSex: patientInfo.sex || prev.patientSex,
            patientBirthDate: patientInfo.birthDate || prev.patientBirthDate,
          }
        : prev,
    );
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedFilters.xray && !selectedFilters.ct && !selectedFilters.cr) {
        params.set('modality', 'x-ray');
      }
      if (selectedFilters.ct && !selectedFilters.xray && !selectedFilters.cr) {
        params.set('modality', 'CT');
      }
      if (selectedFilters.cr && !selectedFilters.xray && !selectedFilters.ct) {
        params.set('modality', 'CR');
      }
      if (selectedFilters.date && startDate) {
        params.set('from', startDate);
      }
      if (selectedFilters.date && endDate) {
        params.set('to', endDate);
      }

      try {
        const response = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }

        const data = await response.json();
        const rawItems = Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
          ? data.value
          : Array.isArray(data?.data)
          ? data.data
          : undefined;

        if (!rawItems) {
          throw new Error('예상치 못한 응답 형식입니다.');
        }

        const normalizedItems = rawItems.map((item, index) => normalizeStudyItem(item, index));
        const enrichedItems = await enrichItemsWithPatientInfo(normalizedItems);
        setItems(enrichedItems);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : '검색 중 오류가 발생했습니다.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedFilters, startDate, endDate]);

  const toggleFilter = (filter: 'xray' | 'ct' | 'cr' | 'date') => {
    setSelectedFilters(prev => {
      const next = { ...prev, [filter]: !prev[filter] };
      if (filter === 'date' && prev.date) {
        setStartDate('');
        setEndDate('');
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSelectedFilters({ xray: false, ct: false, cr: false, date: false });
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    selectedFilters.xray ||
    selectedFilters.ct ||
    selectedFilters.cr ||
    selectedFilters.date ||
    startDate !== '' ||
    endDate !== '';

  const results = useMemo(() => {
    const queryTerm = debouncedQuery.trim().toLowerCase();
    if (!queryTerm) {
      return items;
    }

    return items.filter(item => item.patientName.toLowerCase().includes(queryTerm));
  }, [items, debouncedQuery]);

  return (
    <div className="min-h-screen bg-slate-300 text-slate-900 px-6 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-slate-700">
            <button
              type="button"
              onClick={() => toggleFilter('xray')}
              className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                selectedFilters.xray
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-400 bg-white text-slate-700 hover:border-slate-500'
              }`}
            >
              x-ray
            </button>
            <button
              type="button"
              onClick={() => toggleFilter('ct')}
              className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                selectedFilters.ct
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-400 bg-white text-slate-700 hover:border-slate-500'
              }`}
            >
              CT
            </button>
            <button
              type="button"
              onClick={() => toggleFilter('cr')}
              className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                selectedFilters.cr
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-400 bg-white text-slate-700 hover:border-slate-500'
              }`}
            >
              CR
            </button>
            <button
              type="button"
              onClick={() => toggleFilter('date')}
              className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                selectedFilters.date
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-400 bg-white text-slate-700 hover:border-slate-500'
              }`}
            >
              날짜
            </button>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
            >
              선택 초기화
            </button>
          </div>

          <div className="w-full md:w-80">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="환자명으로 검색..."
                className="w-full rounded-xl border border-slate-400 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {selectedFilters.date && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-4 shadow-sm shadow-slate-200 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-700">날짜 범위를 선택하세요.</div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex flex-col text-xs uppercase tracking-[0.2em] text-slate-500">
                시작
                <input
                  type="date"
                  value={startDate}
                  onChange={event => setStartDate(event.target.value)}
                  className="mt-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                />
              </label>
              <label className="flex flex-col text-xs uppercase tracking-[0.2em] text-slate-500">
                종료
                <input
                  type="date"
                  value={endDate}
                  onChange={event => setEndDate(event.target.value)}
                  className="mt-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                />
              </label>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-400 bg-white/80 px-6 py-10 text-center text-slate-600">
              검색 중입니다...
            </div>
          ) : results.length > 0 ? (
            results.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => void handleSelectItem(item)}
                className="w-full text-left"
              >
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-white px-6 py-5 shadow-sm shadow-slate-200 transition hover:border-slate-500 hover:shadow-md">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {(item.tags ?? []).map(tag => (
                          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <div>{item.date}</div>
                      <div className="mt-2 text-slate-600">환자명 : {item.patientName}</div>
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-400 bg-white/80 px-6 py-10 text-center text-slate-600">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>

      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-2xl font-semibold text-slate-900">{activeItem.title}</h2>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
              >
                닫기
              </button>
            </div>

            <div className="px-6 py-6">
              <dl className="space-y-4">
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Study Date :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.studyDate}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Study Time :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.studyTime}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Accession Number :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.accessionNumber}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Study ID :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.studyId}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Study Instance :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.studyInstance}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Requesting Physician :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.requestingPhysician}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Referring Physician Name :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.referringPhysicianName}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Institution Name :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.institutionName}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Patient ID :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.patientId}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Patient Name :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.patientName}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Patient Birth Date :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.patientBirthDate}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Patient Sex :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.patientSex}</dd>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <dt className="text-sm text-slate-500">Patient Other IDs :</dt>
                  <dd className="text-sm text-slate-700">{activeItem.patientOtherIds}</dd>
                </div>
              </dl>

              <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-100 p-5">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">소견/설명</div>
                <p className="min-h-[180px] text-sm leading-relaxed text-slate-700">{activeItem.notes}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
                  바로가기
                </button>
                <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                  다운로드
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
