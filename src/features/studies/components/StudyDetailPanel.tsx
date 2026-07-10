"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ExternalLink, FileText, Hospital, UserRound, X } from 'lucide-react';
import { StudyItem } from '@/features/studies/types';

interface StudyDetailPanelProps {
  activeItem: StudyItem | null;
  onClose: () => void;
}

type Metadata = {
  study?: {
    date?: string;
    time?: string;
    accessionNumber?: string;
    id?: string;
    referringPhysicianName?: string;
    institutionName?: string;
    description?: string;
  };
  patient?: {
    id?: string;
    name?: string;
    birthDate?: string;
    sex?: string;
  };
  studyInstanceUid?: string;
};

const formatDate = (value: string) => {
  if (!value || value === '-') return '-';
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
  }
  return value.replaceAll('-', '.');
};

const formatTime = (value: string) => {
  if (!value || value === '-') return '-';
  const clean = value.replaceAll(':', '');
  if (/^\d{6}/.test(clean)) {
    return `${clean.slice(0, 2)}:${clean.slice(2, 4)}:${clean.slice(4, 6)}`;
  }
  return value;
};

export default function StudyDetailPanel({ activeItem, onClose }: StudyDetailPanelProps) {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeItem?.id) return;

    const fetchMetadata = async () => {
      setLoading(true);
      setMetadata(null);
      try {
        const response = await fetch(`/api/studies/${activeItem.id}/metadata`, { cache: 'no-store' });
        if (response.ok) {
          setMetadata((await response.json()) as Metadata);
        }
      } catch (error) {
        console.error('Failed to fetch metadata', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [activeItem?.id]);

  if (!activeItem) return null;

  const mergedData = {
    studyDate: activeItem.studyDate || metadata?.study?.date || '-',
    studyTime: activeItem.studyTime || metadata?.study?.time || '-',
    accessionNumber: activeItem.accessionNumber || metadata?.study?.accessionNumber || '-',
    studyId: activeItem.studyId || metadata?.study?.id || '-',
    studyInstance: activeItem.studyInstance || metadata?.studyInstanceUid || '-',
    requestingPhysician: activeItem.requestingPhysician || '-',
    referringPhysicianName: activeItem.referringPhysicianName || metadata?.study?.referringPhysicianName || '-',
    institutionName: activeItem.institutionName || metadata?.study?.institutionName || '-',
    patientId: activeItem.patientId || metadata?.patient?.id || '-',
    patientName: activeItem.patientName || metadata?.patient?.name || '-',
    patientBirthDate: activeItem.patientBirthDate || metadata?.patient?.birthDate || '-',
    patientSex: activeItem.patientSex || metadata?.patient?.sex || '-',
    patientOtherIds: activeItem.patientOtherIds || '-',
    notes: activeItem.notes || metadata?.study?.description || activeItem.title || '-',
    imageCount: activeItem.imageCount || 0,
  };

  const groups = [
    {
      title: '검사 정보',
      icon: FileText,
      fields: [
        { label: '검사일', value: formatDate(mergedData.studyDate) },
        { label: '검사 시간', value: formatTime(mergedData.studyTime) },
        { label: 'Accession No.', value: mergedData.accessionNumber },
        { label: '검사 ID', value: mergedData.studyId },
        { label: 'Study Instance', value: mergedData.studyInstance },
        { label: '이미지 수', value: `${mergedData.imageCount} images` },
      ],
    },
    {
      title: '환자 정보',
      icon: UserRound,
      fields: [
        { label: '환자명', value: mergedData.patientName },
        { label: '환자 ID', value: mergedData.patientId },
        { label: '생년월일', value: formatDate(mergedData.patientBirthDate) },
        { label: '성별', value: mergedData.patientSex },
        { label: '기타 ID', value: mergedData.patientOtherIds },
      ],
    },
    {
      title: '의뢰 정보',
      icon: Hospital,
      fields: [
        { label: '기관명', value: mergedData.institutionName },
        { label: '요청 의사', value: mergedData.requestingPhysician },
        { label: '참조 의사', value: mergedData.referringPhysicianName },
        { label: '비고', value: mergedData.notes },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                {activeItem.modality || activeItem.tags[0] || 'Study'}
              </span>
              {loading && <span className="text-xs font-semibold text-slate-400">메타데이터 불러오는 중</span>}
            </div>
            <h2 className="truncate text-xl font-bold text-slate-950">{activeItem.title || '영상 검사'}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays className="h-4 w-4" />
              {formatDate(mergedData.studyDate)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="상세 닫기"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-150px)] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {groups.map((group) => {
              const Icon = group.icon;
              return (
                <section key={group.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    {group.title}
                  </h3>
                  <div className="space-y-3">
                    {group.fields.map((field) => (
                      <div key={field.label}>
                        <p className="text-xs font-semibold text-slate-400">{field.label}</p>
                        <p className="mt-0.5 break-words text-sm font-semibold text-slate-800">{field.value || '-'}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-lg px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          >
            닫기
          </button>
          <Link
            href={`/?studyId=${activeItem.id}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            뷰어로 열기
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
