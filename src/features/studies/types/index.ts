export interface StudyItem {
  id: number;
  title: string;
  modality: string;
  tags: string[];
  date: string;
  studyDate: string;
  studyTime: string;
  accessionNumber: string;
  studyId: string;
  studyInstance: string;
  requestingPhysician: string;
  referringPhysicianName: string;
  institutionName: string;
  patientId: string;
  patientName: string;
  patientBirthDate: string;
  patientSex: string;
  patientOtherIds: string;
  notes: string;
  imageCount: number;
}

export interface PatientInfo {
  id?: number;
  patientId?: string;
  patientName?: string;
  sex?: string;
  birthDate?: string;
  age?: string;
}

export interface SearchFilters {
  xray: boolean;
  ct: boolean;
  cr: boolean;
  date: boolean;
}

export interface SearchState {
  query: string;
  debouncedQuery: string;
  selectedFilters: SearchFilters;
  startDate: string;
  endDate: string;
  items: StudyItem[];
  activeItem: StudyItem | null;
  loading: boolean;
  error: string | null;
}
