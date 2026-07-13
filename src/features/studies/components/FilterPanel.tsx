"use client";

import { CalendarRange, RotateCcw } from 'lucide-react';
import { useThemeStore } from '@/features/theme/useThemeStore';

type FilterKey = 'xray' | 'ct' | 'cr' | 'dx' | 'date';

interface FilterPanelProps {
  selectedFilters: Record<FilterKey, boolean>;
  onToggleFilter: (filter: FilterKey) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export default function FilterPanel({ selectedFilters, onToggleFilter, onResetFilters, hasActiveFilters }: FilterPanelProps) {
  const { isDark } = useThemeStore();

  const filters = [
    { key: 'xray' as FilterKey, label: 'X-Ray', active: 'border-sky-500/30 bg-sky-500/10 text-sky-400', inactive: isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50' },
    { key: 'ct' as FilterKey, label: 'CT', active: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400', inactive: isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50' },
    { key: 'cr' as FilterKey, label: 'CR', active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', inactive: isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50' },
    { key: 'dx' as FilterKey, label: 'DX', active: 'border-amber-500/30 bg-amber-500/10 text-amber-400', inactive: isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50' },
  ];

  return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
              <button key={filter.key} type="button" onClick={() => onToggleFilter(filter.key)}
                      className={`h-10 rounded-lg border px-3 text-sm font-semibold transition ${selectedFilters[filter.key] ? filter.active : filter.inactive}`}>
                {filter.label}
              </button>
          ))}
          <button type="button" onClick={() => onToggleFilter('date')}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
                      selectedFilters.date
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          : isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
            <CalendarRange className="h-4 w-4" />
            날짜
          </button>
        </div>

        {hasActiveFilters && (
            <button type="button" onClick={onResetFilters}
                    className={`inline-flex h-10 w-fit items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${isDark ? "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"}`}>
              <RotateCcw className="h-4 w-4" />
              초기화
            </button>
        )}
      </div>
  );
}