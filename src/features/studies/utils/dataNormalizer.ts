import { StudyItem } from '@/features/studies/types';

export const normalizeStudyItem = (item: Record<string, unknown>, index: number): StudyItem => {
  const raw = item;
  const getValue = (key: string) => raw[key as keyof typeof raw];

  const id = Number(getValue('id') ?? 0);
  const modalityValue = getValue('modality');
  const studyDateValue = getValue('studyDate');
  const dateValue = getValue('date');

  const tagsValue = getValue('tags');
  const tags = Array.isArray(tagsValue)
    ? tagsValue.map(String)
    : typeof modalityValue === 'string' && modalityValue
    ? [modalityValue]
    : [];

  const titleValue = String(getValue('studyDescription') ?? getValue('title') ?? '').trim();
  const accessionNumber = String(getValue('accessionNumber') ?? getValue('accession_number') ?? '').trim();
  const fallbackAccessionNumber = `ACC-${String(index + 1).padStart(3, '0')}`;

  return {
    id,
    title: titleValue || `영상 검사 ${index + 1}`,
    modality: String(modalityValue ?? ''),
    tags,
    date: String(studyDateValue ?? dateValue ?? ''),
    studyDate: String(studyDateValue ?? dateValue ?? ''),
    studyTime: String(getValue('studyTime') ?? getValue('study_time') ?? ''),
    accessionNumber: accessionNumber || fallbackAccessionNumber,
    studyId: String(getValue('studyId') ?? getValue('id') ?? ''),
    studyInstance: String(getValue('studyInstanceUid') ?? getValue('studyInstance') ?? ''),
    requestingPhysician: String(getValue('requestingPhysician') ?? getValue('requesting_physician') ?? ''),
    referringPhysicianName: String(getValue('referringPhysicianName') ?? getValue('referring_physician_name') ?? ''),
    institutionName: String(getValue('institutionName') ?? getValue('institution_name') ?? ''),
    patientId: String(getValue('patientId') ?? ''),
    patientName: String(getValue('patientName') ?? ''),
    patientBirthDate: String(getValue('patientBirthDate') ?? ''),
    patientSex: String(getValue('patientSex') ?? ''),
    patientOtherIds: String(getValue('patientOtherIds') ?? getValue('patient_other_ids') ?? ''),
    notes: String(getValue('notes') ?? getValue('description') ?? getValue('studyDescription') ?? ''),
    imageCount: Number(getValue('imageCount') ?? 0),
  };
};
