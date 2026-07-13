"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ExternalLink, FileText, Hospital, UserRound, X } from 'lucide-react';
import { StudyItem } from '@/features/studies/types';
import { useThemeStore } from '@/features/theme/useThemeStore';

interface StudyDetailPanelProps {
  activeItem: StudyItem | null;
  onClose: () => void;
}

type Metadata = {
  study?: { date?: string; time?: string; accessionNumber?: string; id?: string; referringPhysicianName?: string; institutionName?: string; description?: string; };
  patient?: { id?: string; name?: string; birthDate?: string; sex?: string; };
  studyInstanceUid?: string;
};

const formatDate = (value: string) => {
  if (!value || value === '-') return '-';
  if (/^\d{8}$/.test(value)) return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
  return value.replaceAll('-', '.');
};

const formatTime = (value: string) => {
  if (!value || value === '-') return '-';
  const clean = value.replaceAll(':', '');
  if (/^\d{6}/.test(clean)) return `${clean.slice(0, 2)}:${clean.slice(2, 4)}:${clean.slice(4, 6)}`;
  return value;
};

export default function StudyDetailPanel({ activeItem, onClose }: StudyDetailPanelProps) {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(false);
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (!activeItem?.id) return;
    const fetchMetadata = async () => {
      setLoading(true);
      setMetadata(null);
      try {
        const response = await fetch(`/api/studies/${activeItem.id}/metadata`, { cache: 'no-store' });
        if (response.ok) setMetadata((await response.json()) as Metadata);
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
    { title: '검사 정보', icon: FileText, fields: [
        { label: '검사일', value: formatDate(mergedData.studyDate) },
        { label: '검사 시간', value: formatTime(mergedData.studyTime) },
        { label: 'Accession No.', value: mergedData.accessionNumber },
        { label: '검사 ID', value: mergedData.studyId },
        { label: 'Study Instance', value: mergedData.studyInstance },
        { label: '이미지 수', value: `${mergedData.imageCount} images` },
      ]},
    { title: '환자 정보', icon: UserRound, fields: [
        { label: '환자명', value: mergedData.patientName },
        { label: '환자 ID', value: mergedData.patientId },
        { label: '생년월일', value: formatDate(mergedData.patientBirthDate) },
        { label: '성별', value: mergedData.patientSex },
        { label: '기타 ID', value: mergedData.patientOtherIds },
      ]},
    { title: '의뢰 정보', icon: Hospital, fields: [
        { label: '기관명', value: mergedData.institutionName },
        { label: '요청 의사', value: mergedData.requestingPhysician },
        { label: '참조 의사', value: mergedData.referringPhysicianName },
        { label: '비고', value: mergedData.notes },
      ]},
  ];

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
        <div className={`max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl ${isDark ? "bg-neutral-900" : "bg-white"}`}>
          <div className={`flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 ${isDark ? "border-neutral-700 bg-neutral-800" : "border-slate-200 bg-slate-50"}`}>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                {activeItem.modality || activeItem.tags[0] || 'Study'}
              </span>
                {loading && <span className={`text-xs font-semibold ${isDark ? "text-neutral-500" : "text-slate-400"}`}>메타데이터 불러오는 중</span>}
              </div>
              <h2 className={`truncate text-xl font-bold ${isDark ? "text-neutral-100" : "text-slate-950"}`}>{activeItem.title || '영상 검사'}</h2>
              <p className={`mt-1 flex items-center gap-2 text-sm ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                <CalendarDays className="h-4 w-4" />
                {formatDate(mergedData.studyDate)}
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="상세 닫기"
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition ${isDark ? "text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100" : "text-slate-500 hover:bg-white hover:text-slate-900"}`}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[calc(92vh-150px)] overflow-y-auto px-5 py-5 sm:px-6">
            <div className="grid gap-4 lg:grid-cols-3">
              {groups.map((group) => {
                const Icon = group.icon;
                return (
                    <section key={group.title} className={`rounded-2xl border p-4 shadow-sm ${isDark ? "border-neutral-700 bg-neutral-800" : "border-slate-200 bg-white"}`}>
                      <h3 className={`mb-4 flex items-center gap-2 text-sm font-bold ${isDark ? "text-neutral-100" : "text-slate-900"}`}>
                    <span className={`grid h-8 w-8 place-items-center rounded-lg ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                        {group.title}
                      </h3>
                      <div className="space-y-3">
                        {group.fields.map((field) => (
                            <div key={field.label}>
                              <p className={`text-xs font-semibold ${isDark ? "text-neutral-500" : "text-slate-400"}`}>{field.label}</p>
                              <p className={`mt-0.5 break-words text-sm font-semibold ${isDark ? "text-neutral-200" : "text-slate-800"}`}>{field.value || '-'}</p>
                            </div>
                        ))}
                      </div>
                    </section>
                );
              })}
            </div>
          </div>

          <div className={`flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6 ${isDark ? "border-neutral-700 bg-neutral-800" : "border-slate-200 bg-slate-50"}`}>
            <button type="button" onClick={onClose}
                    className={`h-11 rounded-lg px-5 text-sm font-bold transition ${isDark ? "text-neutral-300 hover:bg-neutral-700" : "text-slate-600 hover:bg-slate-200"}`}>
              닫기
            </button>
            <Link href={`/?studyId=${activeItem.id}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
              뷰어로 열기
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
  );
}