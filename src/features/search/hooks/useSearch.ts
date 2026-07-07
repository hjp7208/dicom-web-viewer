import { useEffect, useMemo, useState } from 'react';
import { StudyItem, SearchFilters } from '@/features/search/types';
import { fetchSearchResults, enrichItemsWithPatientInfo, fetchPatientInfo } from '@/features/search/api/searchApi';
import { normalizeStudyItem } from '@/features/search/utils/dataNormalizer';

export const useSearch = () => {
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
        const rawItems = await fetchSearchResults(selectedFilters, startDate, endDate);
        const normalizedItems = rawItems.map((item, index) => normalizeStudyItem(item, index));
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
  }, [selectedFilters, startDate, endDate, normalizeStudyItem, enrichItemsWithPatientInfo]);

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
    endDate !== '';

  const results = useMemo(() => {
    const queryTerm = debouncedQuery.trim().toLowerCase();
    if (!queryTerm) return items;

    return items.filter(item => {
      const searchableText = [
        item.title,
        item.patientId,
        item.patientName,
        item.modality,
        item.accessionNumber,
        item.studyId,
        item.institutionName,
        item.requestingPhysician,
        item.referringPhysicianName,
        ...item.tags,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(queryTerm);
    });
  }, [items, debouncedQuery]);

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
