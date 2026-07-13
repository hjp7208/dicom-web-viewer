"use client";

import { FileSearch } from 'lucide-react';
import { StudyItem } from '@/features/studies/types';
import StudyCard from './StudyCard';
import { useThemeStore } from '@/features/theme/useThemeStore';

interface StudyListProps {
  items: StudyItem[];
  loading: boolean;
  onItemClick: (item: StudyItem) => void;
  selectedItemId?: number;
  viewMode?: 'grid' | 'list';
}

export default function StudyList({ items, loading, onItemClick, selectedItemId, viewMode = 'grid' }: StudyListProps) {
  const { isDark } = useThemeStore();

  if (loading) {
    return (
        <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-3'}>
          {Array.from({ length: viewMode === 'grid' ? 6 : 4 }).map((_, index) => (
              <div key={index} className={`h-44 animate-pulse rounded-2xl border p-4 shadow-sm ${isDark ? "border-neutral-700 bg-neutral-900" : "border-slate-200 bg-white"}`}>
                <div className={`mb-5 h-4 w-20 rounded-full ${isDark ? "bg-neutral-800" : "bg-slate-100"}`} />
                <div className={`mb-3 h-5 w-3/4 rounded ${isDark ? "bg-neutral-800" : "bg-slate-100"}`} />
                <div className={`mb-6 h-4 w-1/2 rounded ${isDark ? "bg-neutral-800" : "bg-slate-100"}`} />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => <div key={i} className={`h-10 rounded-lg ${isDark ? "bg-neutral-800" : "bg-slate-100"}`} />)}
                </div>
              </div>
          ))}
        </div>
    );
  }

  if (items.length === 0) {
    return (
        <div className={`rounded-2xl border border-dashed px-6 py-14 text-center shadow-sm ${isDark ? "border-neutral-700 bg-neutral-900" : "border-slate-300 bg-white"}`}>
          <div className={`mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full ${isDark ? "bg-neutral-800 text-neutral-400" : "bg-slate-100 text-slate-500"}`}>
            <FileSearch className="h-6 w-6" />
          </div>
          <p className={`text-base font-semibold ${isDark ? "text-neutral-200" : "text-slate-900"}`}>검색 결과가 없습니다</p>
          <p className={`mt-1 text-sm ${isDark ? "text-neutral-500" : "text-slate-500"}`}>검색어를 줄이거나 필터 조건을 변경해보세요.</p>
        </div>
    );
  }

  return (
      <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-3'}>
        {items.map((item) => (
            <StudyCard key={item.id} item={item} onClick={() => onItemClick(item)} selected={selectedItemId === item.id} viewMode={viewMode} />
        ))}
      </div>
  );
}