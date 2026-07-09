"use client";

import { StudyItem } from '@/features/studies/types';

interface StudyCardProps {
  item: StudyItem;
  onClick: () => void;
}

export default function StudyCard({ item, onClick }: StudyCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-slate-400 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="flex-1 text-base font-semibold text-slate-900 group-hover:text-slate-700">
          {item.title}
        </h3>
        <div className="ml-2 flex flex-wrap gap-1">
          {item.tags.map((tag, idx) => (
            <span
              key={idx}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{item.date}</span>
        <span className="font-medium text-slate-700">{item.patientName}</span>
      </div>
    </button>
  );
}
