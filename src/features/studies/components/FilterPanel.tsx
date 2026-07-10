"use client";

import { CalendarRange, RotateCcw } from 'lucide-react';

type FilterKey = 'xray' | 'ct' | 'cr' | 'dx' | 'date';

interface FilterPanelProps {
  selectedFilters: Record<FilterKey, boolean>;
  onToggleFilter: (filter: FilterKey) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const filters: Array<{ key: FilterKey; label: string; tone: string }> = [
  { key: 'xray', label: 'X-Ray', tone: 'bg-sky-50 text-sky-700 border-sky-200' },
  { key: 'ct', label: 'CT', tone: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { key: 'cr', label: 'CR', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'dx', label: 'DX', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
];

export default function FilterPanel({
  selectedFilters,
  onToggleFilter,
  onResetFilters,
  hasActiveFilters,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => onToggleFilter(filter.key)}
            className={`h-10 rounded-lg border px-3 text-sm font-semibold transition ${
              selectedFilters[filter.key]
                ? filter.tone
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onToggleFilter('date')}
          className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
            selectedFilters.date
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <CalendarRange className="h-4 w-4" />
          날짜
        </button>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white"
        >
          <RotateCcw className="h-4 w-4" />
          초기화
        </button>
      )}
    </div>
  );
}
