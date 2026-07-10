"use client";

import { CalendarDays, ChevronRight, Hash, Images, UserRound } from 'lucide-react';
import { StudyItem } from '@/features/studies/types';

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

const getModalityTone = (modality: string) => {
  const normalized = modality.toUpperCase();
  if (normalized.includes('CT')) return 'border-indigo-200 bg-indigo-50 text-indigo-700';
  if (normalized.includes('CR')) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (normalized.includes('DX')) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-sky-200 bg-sky-50 text-sky-700';
};

export default function StudyCard({ item, onClick, selected = false, viewMode = 'grid' }: StudyCardProps) {
  const modality = item.modality || item.tags[0] || 'Study';
  const isList = viewMode === 'list';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md ${
        selected ? 'border-blue-400 ring-4 ring-blue-100' : 'border-slate-200'
      } ${isList ? 'p-4' : 'p-5'}`}
    >
      <div className={isList ? 'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between' : 'flex h-full flex-col'}>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getModalityTone(modality)}`}>
              {modality.toUpperCase()}
            </span>
            {item.patientSex && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {item.patientSex}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 text-base font-bold text-slate-950 transition group-hover:text-blue-700">
            {item.title || '영상 검사'}
          </h3>

          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <span className="flex min-w-0 items-center gap-2">
              <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate font-semibold text-slate-800">{item.patientName || '이름 없음'}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{formatDate(item.studyDate || item.date)}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <Hash className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{item.accessionNumber || item.studyId || '-'}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <Images className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{item.imageCount || 0} images</span>
            </span>
          </div>
        </div>

        <div
          className={`mt-5 flex items-center justify-between border-t border-slate-100 pt-4 ${
            isList ? 'lg:mt-0 lg:border-t-0 lg:pt-0' : ''
          }`}
        >
          <span className="text-xs font-medium text-slate-400">Patient ID {item.patientId || '-'}</span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-50 text-slate-500 transition group-hover:bg-blue-600 group-hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  );
}
