"use client";

import { CalendarDays, ChevronRight, Hash, Images, UserRound } from 'lucide-react';
import { StudyItem } from '@/features/studies/types';
import { useThemeStore } from '@/features/theme/useThemeStore';

interface StudyCardProps {
  item: StudyItem;
  onClick: () => void;
  selected?: boolean;
  viewMode?: 'grid' | 'list';
}

const formatDate = (value: string) => {
  if (!value) return '-';
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
  }
  return value.replaceAll('-', '.');
};

const getModalityTone = (modality: string, isDark: boolean) => {
  const normalized = modality.toUpperCase();
  if (isDark) {
    if (normalized.includes('CT')) return 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400';
    if (normalized.includes('CR')) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    if (normalized.includes('DX')) return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
    return 'border-sky-500/30 bg-sky-500/10 text-sky-400';
  }
  if (normalized.includes('CT')) return 'border-indigo-200 bg-indigo-50 text-indigo-700';
  if (normalized.includes('CR')) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (normalized.includes('DX')) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-sky-200 bg-sky-50 text-sky-700';
};

export default function StudyCard({ item, onClick, selected = false, viewMode = 'grid' }: StudyCardProps) {
  const { isDark } = useThemeStore();
  const modality = item.modality || item.tags[0] || 'Study';
  const isList = viewMode === 'list';

  return (
      <button
          type="button"
          onClick={onClick}
          className={`group relative w-full rounded-2xl border text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              isDark
                  ? `bg-neutral-900 hover:border-blue-500/50 ${selected ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-neutral-700'}`
                  : `bg-white hover:border-blue-200 ${selected ? 'border-blue-400 ring-4 ring-blue-100' : 'border-slate-200'}`
          } ${isList ? 'p-4' : 'p-5'}`}
      >
        <div className={isList ? 'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between' : 'flex h-full flex-col'}>
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getModalityTone(modality, isDark)}`}>
              {modality.toUpperCase()}
            </span>
              {item.patientSex && (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isDark ? "bg-neutral-800 text-neutral-300" : "bg-slate-100 text-slate-600"}`}>
                {item.patientSex}
              </span>
              )}
            </div>

            <h3 className={`line-clamp-2 text-base font-bold transition group-hover:text-blue-500 ${isDark ? "text-neutral-100" : "text-slate-950 group-hover:text-blue-700"}`}>
              {item.title || '영상 검사'}
            </h3>

            <div className={`mt-3 grid gap-2 text-sm sm:grid-cols-2 ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
            <span className="flex min-w-0 items-center gap-2">
              <UserRound className={`h-4 w-4 shrink-0 ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
              <span className={`truncate font-semibold ${isDark ? "text-neutral-200" : "text-slate-800"}`}>{item.patientName || '이름 없음'}</span>
            </span>
              <span className="flex min-w-0 items-center gap-2">
              <CalendarDays className={`h-4 w-4 shrink-0 ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
              <span className="truncate">{formatDate(item.studyDate || item.date)}</span>
            </span>
              <span className="flex min-w-0 items-center gap-2">
              <Hash className={`h-4 w-4 shrink-0 ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
              <span className="truncate">{item.accessionNumber || item.studyId || '-'}</span>
            </span>
              <span className="flex min-w-0 items-center gap-2">
              <Images className={`h-4 w-4 shrink-0 ${isDark ? "text-neutral-500" : "text-slate-400"}`} />
              <span className="truncate">{item.imageCount || 0} images</span>
            </span>
            </div>
          </div>

          <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-neutral-700" : "border-slate-100"} ${isList ? 'lg:mt-0 lg:border-t-0 lg:pt-0' : ''}`}>
            <span className={`text-xs font-medium ${isDark ? "text-neutral-500" : "text-slate-400"}`}>Patient ID {item.patientId || '-'}</span>
            <span className={`grid h-9 w-9 place-items-center rounded-full transition group-hover:bg-blue-600 group-hover:text-white ${isDark ? "bg-neutral-800 text-neutral-400" : "bg-slate-50 text-slate-500"}`}>
            <ChevronRight className="h-4 w-4" />
          </span>
          </div>
        </div>
      </button>
  );
}