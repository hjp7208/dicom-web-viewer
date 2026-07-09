import { useEffect, useState } from 'react';
import { StudyItem, SearchFilters } from '@/features/studies/types';
import { fetchStudies, enrichItemsWithPatientInfo, fetchPatientInfo } from '@/features/studies/api/studiesApi';
import { normalizeStudyItem } from '@/features/studies/utils/dataNormalizer';

/**
 * DICOM 검사 목록 검색 및 필터링 상태 관리를 담당하는 커스텀 훅
 * 검색어 디바운싱, 데이터 패칭, 상세 정보 조회 로직을 포함합니다.
 */
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

  // 검색어 입력 시 300ms 지연 후 디바운스된 상태 업데이트 (불필요한 API 호출 방지)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  // 검색 조건(디바운스된 검색어, 필터, 날짜)이 변경될 때마다 검사 목록 데이터를 다시 불러옵니다.
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

  /**
   * 개별 모달리티 필터를 토글합니다.
   * Date 필터를 해제할 경우 시작/종료 날짜도 초기화합니다.
   */
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

  /**
   * 모든 필터 및 검색 조건을 초기 상태로 되돌립니다.
   */
  const resetFilters = () => {
    setSelectedFilters({ xray: false, ct: false, cr: false, date: false });
    setStartDate('');
    setEndDate('');
    setQuery('');
  };

  /**
   * 검사 항목을 클릭하여 활성화(모달 등)하고,
   * 필요한 경우 환자 상세 정보를 추가로 패칭하여 상태를 업데이트합니다.
   */
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
