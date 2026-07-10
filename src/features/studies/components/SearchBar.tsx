"use client";

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  query,
  onQueryChange,
  placeholder = '환자명, 검사 ID, Accession No.로 검색',
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-base font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          aria-label="검색어 지우기"
          className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
