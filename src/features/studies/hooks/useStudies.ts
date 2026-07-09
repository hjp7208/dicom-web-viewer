import { useEffect, useState } from 'react';
import { StudyItem, SearchFilters } from '@/features/studies/types';
import { fetchStudies, enrichItemsWithPatientInfo, fetchPatientInfo } from '@/features/studies/api/studiesApi';
import { normalizeStudyItem } from '@/features/studies/utils/dataNormalizer';

export const useStudies = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({ xray: false, ct: false, cr: false, date: false });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [items, setItems] = useState<StudyItem[]>([]);
  const [activeItem, setActiveItem] = useState<StudyItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce query
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const rawItems = await fetchStudies(debouncedQuery, selectedFilters, startDate, endDate);
        const normalizedItems = rawItems.map((item: Record<string, unknown>, index: number) => normalizeStudyItem(item, index));
        const enrichedItems = await enrichItemsWithPatientInfo(normalizedItems);
        setItems(enrichedItems);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : '검색 중 오류가 발생했습니다.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, selectedFilters, startDate, endDate]);

  const toggleFilter = (filter: keyof SearchFilters) => {
    setSelectedFilters(prev => {
      const next = { ...prev, [filter]: !prev[filter] };
      if (filter === 'date' && prev.date) {
        setStartDate('');
        setEndDate('');
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSelectedFilters({ xray: false, ct: false, cr: false, date: false });
    setStartDate('');
    setEndDate('');
    setQuery('');
  };

  const handleSelectItem = async (item: StudyItem) => {
    setActiveItem(item);

    if (!item.patientId) {
      return;
    }

    const patientInfo = await fetchPatientInfo(item.patientId);
    if (!patientInfo) {
      return;
    }

    setActiveItem(prev =>
      prev
        ? {
            ...prev,
            patientName: patientInfo.patientName || prev.patientName,
            patientSex: patientInfo.sex || prev.patientSex,
            patientBirthDate: patientInfo.birthDate || prev.patientBirthDate,
          }
        : prev,
    );
  };

  const hasActiveFilters =
    selectedFilters.xray ||
    selectedFilters.ct ||
    selectedFilters.cr ||
    selectedFilters.date ||
    startDate !== '' ||
    endDate !== '' ||
    query !== '';

  const results = items;

  return {
    // State
    query,
    items,
    activeItem,
    loading,
    error,
    selectedFilters,
    startDate,
    endDate,
    results,
    hasActiveFilters,
    
    // Actions
    setQuery,
    setStartDate,
    setEndDate,
    setActiveItem,
    toggleFilter,
    resetFilters,
    handleSelectItem,
  };
};
