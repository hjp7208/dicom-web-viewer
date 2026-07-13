"use client";

import { Search, X } from 'lucide-react';
import { useThemeStore } from '@/features/theme/useThemeStore';

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
    const { isDark } = useThemeStore();

    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
            <input
                type="text"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder={placeholder}
                className={`h-14 w-full rounded-2xl border pl-12 pr-12 text-base font-medium shadow-sm outline-none transition ${
                    isDark
                        ? "border-neutral-700 bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                }`}
            />
            {query && (
                <button
                    type="button"
                    onClick={() => onQueryChange('')}
                    aria-label="검색어 지우기"
                    className={`absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full transition ${
                        isDark
                            ? "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}