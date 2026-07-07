import { StudyItem, PatientInfo } from '@/features/search/types';

export const fetchPatientInfo = async (patientId: string): Promise<PatientInfo | null> => {
  if (!patientId) {
    return null;
  }

  const response = await fetch(`/api/patients/${encodeURIComponent(patientId)}`, { cache: 'no-store' });
  if (!response.ok) {
    console.error('환자정보 조회 실패', response.statusText);
    return null;
  }

  return (await response.json()) as PatientInfo;
};

export const enrichItemsWithPatientInfo = async (studyItems: StudyItem[]): Promise<StudyItem[]> => {
  const patientIds = Array.from(new Set(studyItems.map(item => item.patientId).filter(Boolean)));
  if (patientIds.length === 0) {
    return studyItems;
  }

  const patientInfoEntries = await Promise.all(
    patientIds.map(async patientId => {
      const info = await fetchPatientInfo(patientId);
      return [patientId, info] as const;
    }),
  );

  const patientInfoMap = new Map(
    patientInfoEntries.filter((entry): entry is [string, PatientInfo] => entry[1] !== null),
  );

  return studyItems.map(item => {
    const patientInfo = patientInfoMap.get(item.patientId);
    if (!patientInfo) {
      return item;
    }

    return {
      ...item,
      patientName: patientInfo.patientName || item.patientName,
      patientSex: patientInfo.sex || item.patientSex,
      patientBirthDate: patientInfo.birthDate || item.patientBirthDate,
    };
  });
};

export const fetchSearchResults = async (
  selectedFilters: { xray: boolean; ct: boolean; cr: boolean; date: boolean },
  startDate: string,
  endDate: string
): Promise<StudyItem[]> => {
  const params = new URLSearchParams();
  
  if (selectedFilters.xray && !selectedFilters.ct && !selectedFilters.cr) {
    params.set('modality', 'x-ray');
  }
  if (selectedFilters.ct && !selectedFilters.xray && !selectedFilters.cr) {
    params.set('modality', 'CT');
  }
  if (selectedFilters.cr && !selectedFilters.xray && !selectedFilters.ct) {
    params.set('modality', 'CR');
  }
  if (selectedFilters.date && startDate) {
    params.set('from', startDate);
  }
  if (selectedFilters.date && endDate) {
    params.set('to', endDate);
  }

  const response = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`서버 오류: ${response.status}`);
  }

  const data = await response.json();
  const rawItems = Array.isArray(data)
    ? data
    : Array.isArray(data?.value)
    ? data.value
    : Array.isArray(data?.data)
    ? data.data
    : undefined;

  if (!rawItems) {
    throw new Error('예상치 못한 응답 형식입니다.');
  }

  return rawItems;
};
