"use client";

import { StudyItem } from '@/features/studies/types';
import StudyCard from './StudyCard';

interface StudyListProps {
  items: StudyItem[];
  loading: boolean;
  onItemClick: (item: StudyItem) => void;
}

export default function StudyList({ items, loading, onItemClick }: StudyListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">로딩 중...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center">
        <p className="text-slate-500">검색 결과가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <StudyCard key={item.id} item={item} onClick={() => onItemClick(item)} />
      ))}
    </div>
  );
}
