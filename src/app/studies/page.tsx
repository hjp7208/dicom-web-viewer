"use client";

import { useStudies } from '@/features/studies/hooks/useStudies';
import FilterPanel from '@/features/studies/components/FilterPanel';
import SearchBar from '@/features/studies/components/SearchBar';
import DateRangePicker from '@/features/studies/components/DateRangePicker';
import ErrorMessage from '@/features/studies/components/ErrorMessage';
import StudyList from '@/features/studies/components/StudyList';
import StudyDetailPanel from '@/features/studies/components/StudyDetailPanel';

export default function SearchPage() {
  const {
    query,
    activeItem,
    loading,
    error,
    selectedFilters,
    startDate,
    endDate,
    results,
    hasActiveFilters,
    setQuery,
    setStartDate,
    setEndDate,
    setActiveItem,
    toggleFilter,
    resetFilters,
    handleSelectItem,
  } = useStudies();

  return (
    <div className="min-h-screen bg-slate-300 text-slate-900 px-6 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <FilterPanel
            selectedFilters={selectedFilters}
            onToggleFilter={toggleFilter}
            onResetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {selectedFilters.date && (
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        )}

        {error && <ErrorMessage message={error} />}

        <div className="mb-6">
          <SearchBar query={query} onQueryChange={setQuery} />
        </div>

        <StudyList items={results} loading={loading} onItemClick={handleSelectItem} />

        {activeItem && (
          <StudyDetailPanel activeItem={activeItem} onClose={() => setActiveItem(null)} />
        )}
      </div>
    </div>
  );
}
