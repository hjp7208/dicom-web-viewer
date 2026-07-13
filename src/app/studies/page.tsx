"use client";

import { useMemo, useState } from 'react';
import { CalendarDays, Grid2X2, List, SlidersHorizontal } from 'lucide-react';
import DateRangePicker from '@/features/studies/components/DateRangePicker';
import ErrorMessage from '@/features/studies/components/ErrorMessage';
import FilterPanel from '@/features/studies/components/FilterPanel';
import SearchBar from '@/features/studies/components/SearchBar';
import StudyDetailPanel from '@/features/studies/components/StudyDetailPanel';
import StudyList from '@/features/studies/components/StudyList';
import { useStudies } from '@/features/studies/hooks/useStudies';
import { StudyItem } from '@/features/studies/types';
import { useThemeStore } from '@/features/theme/useThemeStore';

type ViewMode = 'grid' | 'list';

const formatStudyDate = (value: string) => {
  if (!value) return '-';
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`;
  }
  return value.replaceAll('-', '.');
};

const getStudyDateValue = (item: StudyItem) => item.studyDate || item.date || '';

export default function SearchPage() {
  const { isDark } = useThemeStore();
  const {
    query, activeItem, loading, error, selectedFilters,
    startDate, endDate, results, hasActiveFilters,
    setQuery, setStartDate, setEndDate, setActiveItem,
    toggleFilter, resetFilters, handleSelectItem,
  } = useStudies();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const modalitySummary = useMemo(() => {
    return results.reduce<Record<string, number>>((acc, item) => {
      const key = (item.modality || item.tags[0] || '기타').toUpperCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [results]);

  const latestStudy = useMemo(() => {
    return results.reduce<StudyItem | null>((latest, item) => {
      if (!latest) return item;
      return getStudyDateValue(item).localeCompare(getStudyDateValue(latest)) > 0 ? item : latest;
    }, null);
  }, [results]);

  const latestDate = latestStudy ? formatStudyDate(getStudyDateValue(latestStudy)) : '-';
  const totalImages = results.reduce((sum, item) => sum + (Number(item.imageCount) || 0), 0);
  const filterCount = Object.values(selectedFilters).filter(Boolean).length + (query ? 1 : 0);

  return (
      <div className={`min-h-screen ${isDark ? "text-neutral-100" : "bg-[#eef3f8] text-slate-950"}`}
           style={isDark ? { backgroundColor: '#121212' } : {}}>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
            <section className={`overflow-hidden rounded-[28px] border ${isDark ? "border-neutral-700 bg-neutral-900" : "border-white/70 bg-white"} shadow-sm`}>
              <div className={`grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_360px] lg:p-8 ${isDark ? "" : "bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.14),transparent_28%),linear-gradient(135deg,#ffffff_0%,#f7fbff_55%,#e9f2ff_100%)]"}`}>
                <div className="flex min-w-0 flex-col justify-between gap-6">
                  <div>
                    <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${isDark ? "border-blue-500/30 bg-blue-500/10 text-blue-400" : "border-blue-100 bg-blue-50 text-blue-700"}`}>
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Studies Search
                    </div>
                    <h1 className={`text-3xl font-bold tracking-normal sm:text-4xl ${isDark ? "text-neutral-100" : "text-slate-950"}`}>
                      검사 목록을 빠르게 찾고 확인하세요
                    </h1>
                    <p className={`mt-3 max-w-2xl text-sm leading-6 ${isDark ? "text-neutral-400" : "text-slate-600"}`}>
                      환자명, 검사 ID, 모달리티, 날짜 조건을 한 곳에서 조합해 필요한 DICOM 검사를 정리합니다.
                    </p>
                  </div>
                  <SearchBar query={query} onQueryChange={setQuery} />
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    { label: 'Results', value: results.length },
                    { label: 'Images', value: totalImages },
                    { label: 'Latest', value: latestDate, isDate: true },
                  ].map(({ label, value, isDate }) => (
                      <div key={label} className={`rounded-2xl border p-4 shadow-sm ${isDark ? "border-neutral-700 bg-neutral-800" : "border-white/80 bg-white/85"}`}>
                        <p className={`text-xs font-semibold uppercase ${isDark ? "text-neutral-400" : "text-slate-500"}`}>{label}</p>
                        <p className={`mt-2 font-bold ${isDark ? "text-neutral-100" : "text-slate-950"} ${isDate ? "flex items-center gap-2 text-lg" : "text-3xl"}`}>
                          {isDate && <CalendarDays className="h-5 w-5 text-blue-500" />}
                          {value}
                        </p>
                      </div>
                  ))}
                </div>
              </div>
            </section>

            <section className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${isDark ? "border-neutral-700 bg-neutral-900" : "border-slate-200 bg-white"}`}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <FilterPanel
                    selectedFilters={selectedFilters}
                    onToggleFilter={toggleFilter}
                    onResetFilters={resetFilters}
                    hasActiveFilters={hasActiveFilters}
                />
                <div className={`flex h-10 w-fit rounded-lg border p-1 ${isDark ? "border-neutral-700 bg-neutral-800" : "border-slate-200 bg-slate-50"}`}>
                  <button type="button" onClick={() => setViewMode('grid')} aria-label="그리드 보기"
                          className={`grid h-8 w-9 place-items-center rounded-md transition ${viewMode === 'grid' ? isDark ? "bg-neutral-700 text-blue-400" : "bg-white text-blue-600 shadow-sm" : isDark ? "text-neutral-400 hover:text-neutral-100" : "text-slate-500 hover:text-slate-900"}`}>
                    <Grid2X2 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setViewMode('list')} aria-label="리스트 보기"
                          className={`grid h-8 w-9 place-items-center rounded-md transition ${viewMode === 'list' ? isDark ? "bg-neutral-700 text-blue-400" : "bg-white text-blue-600 shadow-sm" : isDark ? "text-neutral-400 hover:text-neutral-100" : "text-slate-500 hover:text-slate-900"}`}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {selectedFilters.date && (
                  <div className="mt-4">
                    <DateRangePicker startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
                  </div>
              )}
            </section>

            {error && <ErrorMessage message={error} />}

            <section className="flex flex-col gap-4">
              <div className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-neutral-700 bg-neutral-900" : "border-slate-200 bg-white"}`}>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? "text-neutral-100" : "text-slate-900"}`}>검색 결과</p>
                  <p className={`text-xs ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                    {filterCount > 0 ? `${filterCount}개 조건 적용 중` : '전체 검사 목록을 표시 중입니다'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(modalitySummary).slice(0, 5).map(([modality, count]) => (
                      <span key={modality} className={`rounded-full border px-3 py-1 text-xs font-semibold ${isDark ? "border-neutral-700 bg-neutral-800 text-neutral-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                    {modality} {count}
                  </span>
                  ))}
                </div>
              </div>
              <StudyList items={results} loading={loading} onItemClick={handleSelectItem} selectedItemId={activeItem?.id} viewMode={viewMode} />
            </section>
          </div>
        </main>

        {activeItem && <StudyDetailPanel activeItem={activeItem} onClose={() => setActiveItem(null)} />}
      </div>
  );
}