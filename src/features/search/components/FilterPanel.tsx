"use client";

interface FilterPanelProps {
  selectedFilters: {
    xray: boolean;
    ct: boolean;
    cr: boolean;
    date: boolean;
  };
  onToggleFilter: (filter: 'xray' | 'ct' | 'cr' | 'date') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export default function FilterPanel({
  selectedFilters,
  onToggleFilter,
  onResetFilters,
  hasActiveFilters,
}: FilterPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-slate-700">
      <button
        type="button"
        onClick={() => onToggleFilter('xray')}
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
        onClick={() => onToggleFilter('ct')}
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
        onClick={() => onToggleFilter('cr')}
        className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
          selectedFilters.cr
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-400 bg-white text-slate-700 hover:border-slate-500'
        }`}
      >
        CR
      </button>
      <button
        type="button"
        onClick={() => onToggleFilter('date')}
        className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
          selectedFilters.date
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-400 bg-white text-slate-700 hover:border-slate-500'
        }`}
      >
        날짜
      </button>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition border-slate-400 bg-white text-slate-700 hover:border-slate-500"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
}
