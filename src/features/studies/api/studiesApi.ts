import { StudyItem, PatientInfo } from '@/features/studies/types';

type StudyFilters = {
  xray: boolean;
  ct: boolean;
  cr: boolean;
  dx: boolean;
  date: boolean;
};

export const fetchPatientInfo = async (patientId: string): Promise<PatientInfo | null> => {
  if (!patientId) {
    return null;
  }

  const response = await fetch(`/api/patients/${encodeURIComponent(patientId)}`, { cache: 'no-store' });
  if (!response.ok) {
    console.error('환자 정보 조회 실패', response.statusText);
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

export const fetchStudies = async (
  query: string,
  selectedFilters: StudyFilters,
  startDate: string,
  endDate: string
): Promise<Record<string, unknown>[]> => {
  const params = new URLSearchParams();
  const selectedModalities = [
    selectedFilters.xray ? 'x-ray' : null,
    selectedFilters.ct ? 'CT' : null,
    selectedFilters.cr ? 'CR' : null,
    selectedFilters.dx ? 'DX' : null,
  ].filter(Boolean);

  if (query.trim()) {
    params.set('keyword', query.trim());
  }
  if (selectedModalities.length === 1) {
    params.set('modality', selectedModalities[0] as string);
  }
  if (selectedFilters.date && startDate) {
    params.set('from', startDate);
  }
  if (selectedFilters.date && endDate) {
    params.set('to', endDate);
  }

  const queryString = params.toString();
  const url = queryString ? `/api/studies?${queryString}` : '/api/studies';

  const response = await fetch(url, { cache: 'no-store' });
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
    throw new Error('예상하지 못한 응답 형식입니다.');
  }

  return rawItems;
};
