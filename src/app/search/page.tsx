"use client";

import { useMemo, useState } from 'react';

const sampleItems = [
  {
    id: 1,
    title: 'Study Description',
    modality: 'x-ray',
    tags: ['x-ray'],
    date: '2025.04.27',
    studyDate: '2025.04.27',
    studyTime: '10:20',
    accessionNumber: 'AC-1234',
    studyId: 'ST-0001',
    studyInstance: 'SI-001',
    requestingPhysician: 'Dr. Kim',
    referringPhysicianName: 'Dr. Lee',
    institutionName: 'University Hospital',
    patientId: 'P-1001',
    patientName: '홍길동',
    patientBirthDate: '1982.05.12',
    patientSex: 'M',
    patientOtherIds: 'ID-201',
    notes: 'Lung opacity observed in left lower lobe. Follow-up recommended.',
  },
  {
    id: 2,
    title: 'Study Description',
    modality: 'CT',
    tags: ['CT'],
    date: '2025.04.27',
    studyDate: '2025.04.27',
    studyTime: '11:00',
    accessionNumber: 'AC-1235',
    studyId: 'ST-0002',
    studyInstance: 'SI-002',
    requestingPhysician: 'Dr. Park',
    referringPhysicianName: 'Dr. Choi',
    institutionName: 'City Medical Center',
    patientId: 'P-1002',
    patientName: '김철수',
    patientBirthDate: '1975.08.20',
    patientSex: 'M',
    patientOtherIds: 'ID-202',
    notes: 'CT scan of abdomen. No abnormal mass noted.',
  },
  {
    id: 3,
    title: 'Study Description',
    modality: 'CT, x-ray',
    tags: ['CT', 'x-ray'],
    date: '2025.04.27',
    studyDate: '2025.04.27',
    studyTime: '09:45',
    accessionNumber: 'AC-1236',
    studyId: 'ST-0003',
    studyInstance: 'SI-003',
    requestingPhysician: 'Dr. Han',
    referringPhysicianName: 'Dr. Jung',
    institutionName: 'Central Clinic',
    patientId: 'P-1003',
    patientName: '이영희',
    patientBirthDate: '1990.02.14',
    patientSex: 'F',
    patientOtherIds: 'ID-203',
    notes: 'Combined CT and x-ray study. Mild findings consistent with chronic bronchitis.',
  },
  {
    id: 4,
    title: 'Study Description',
    modality: 'x-ray',
    tags: ['x-ray'],
    date: '2025.04.27',
    studyDate: '2025.04.27',
    studyTime: '12:15',
    accessionNumber: 'AC-1237',
    studyId: 'ST-0004',
    studyInstance: 'SI-004',
    requestingPhysician: 'Dr. Yoon',
    referringPhysicianName: 'Dr. Shim',
    institutionName: 'St. Mary Hospital',
    patientId: 'P-1004',
    patientName: '박영자',
    patientBirthDate: '1968.11.05',
    patientSex: 'F',
    patientOtherIds: 'ID-204',
    notes: 'Chest x-ray with no acute cardiopulmonary abnormality.',
  },
  {
    id: 5,
    title: 'Study Description',
    modality: 'x-ray',
    tags: ['x-ray'],
    date: '2025.04.27',
    studyDate: '2025.04.27',
    studyTime: '14:30',
    accessionNumber: 'AC-1238',
    studyId: 'ST-0005',
    studyInstance: 'SI-005',
    requestingPhysician: 'Dr. Seo',
    referringPhysicianName: 'Dr. Kim',
    institutionName: 'North Clinic',
    patientId: 'P-1005',
    patientName: '최민수',
    patientBirthDate: '1988.12.09',
    patientSex: 'M',
    patientOtherIds: 'ID-205',
    notes: 'Follow-up x-ray for previous trauma. Stable appearance.',
  },
];

const parseDate = (dateString: string) => {
  const [year, month, day] = dateString.split('.').map(Number);
  return new Date(year, month - 1, day);
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({ xray: false, ct: false, date: false });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeItem, setActiveItem] = useState<typeof sampleItems[number] | null>(null);

  const toggleFilter = (filter: 'xray' | 'ct' | 'date') => {
    setSelectedFilters(prev => {
      const next = { ...prev, [filter]: !prev[filter] };
      if (filter === 'date' && prev.date) {
        setStartDate('');
        setEndDate('');
      }
      return next;
    });
  };

  const results = useMemo(() => {
    return sampleItems.filter(item => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.modality.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        item.patientName.toLowerCase().includes(query.toLowerCase());

      if (!matchesQuery) {
        return false;
      }

      if (selectedFilters.xray && !item.tags.includes('x-ray')) {
        return false;
      }

      if (selectedFilters.ct && !item.tags.includes('CT')) {
        return false;
      }

      if (selectedFilters.date && startDate && endDate) {
        const itemDate = parseDate(item.date);
        const fromDate = new Date(startDate);
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
        if (itemDate < fromDate || itemDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [query, selectedFilters, startDate, endDate]);

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
              onClick={() => toggleFilter('date')}
              className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                selectedFilters.date
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-400 bg-white text-slate-700 hover:border-slate-500'
              }`}
            >
              날짜
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
          {results.length > 0 ? (
            results.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveItem(item)}
                className="w-full text-left"
              >
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-white px-6 py-5 shadow-sm shadow-slate-200 transition hover:border-slate-500 hover:shadow-md">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {item.tags.map(tag => (
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
              검색어를 입력하면 결과가 표시됩니다.
            </div>
          )}
        </div>
      </div>

      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-2xl font-semibold text-slate-900">Study Description</h2>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
              >
                닫기
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="grid gap-4 md:grid-cols-3 md:items-start">
                <div className="space-y-3">
                  <div className="text-sm text-slate-500">Study Date :</div>
                  <div className="text-sm text-slate-500">Study Time :</div>
                  <div className="text-sm text-slate-500">Accession Number :</div>
                  <div className="text-sm text-slate-500">Study ID :</div>
                  <div className="text-sm text-slate-500">Study Instance :</div>
                  <div className="text-sm text-slate-500">Requesting Physician :</div>
                  <div className="text-sm text-slate-500">Referring Physician Name :</div>
                  <div className="text-sm text-slate-500">Institution Name :</div>
                  <div className="text-sm text-slate-500">Patient ID :</div>
                  <div className="text-sm text-slate-500">Patient Name :</div>
                  <div className="text-sm text-slate-500">Patient Birth Date :</div>
                  <div className="text-sm text-slate-500">Patient Sex :</div>
                  <div className="text-sm text-slate-500">Patient Other IDs :</div>
                </div>
                <div className="md:col-span-2 space-y-3 text-sm text-slate-700">
                  <div>{activeItem.studyDate}</div>
                  <div>{activeItem.studyTime}</div>
                  <div>{activeItem.accessionNumber}</div>
                  <div>{activeItem.studyId}</div>
                  <div>{activeItem.studyInstance}</div>
                  <div>{activeItem.requestingPhysician}</div>
                  <div>{activeItem.referringPhysicianName}</div>
                  <div>{activeItem.institutionName}</div>
                  <div>{activeItem.patientId}</div>
                  <div>{activeItem.patientName}</div>
                  <div>{activeItem.patientBirthDate}</div>
                  <div>{activeItem.patientSex}</div>
                  <div>{activeItem.patientOtherIds}</div>
                </div>
              </div>

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
