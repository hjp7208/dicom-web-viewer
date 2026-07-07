import { StudyItem } from '@/features/search/types';

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

  return {
    id,
    title: titleValue || `의료영상${index + 1}`,
    modality: String(modalityValue ?? ''),
    tags,
    date: String(studyDateValue ?? dateValue ?? ''),
    studyDate: String(studyDateValue ?? dateValue ?? ''),
    studyTime: String(getValue('studyTime') ?? getValue('study_time') ?? ''),
    accessionNumber: String(getValue('accessionNumber') ?? getValue('accession_number') ?? ''),
    studyId: String(getValue('studyId') ?? getValue('study_instance_uid') ?? getValue('studyInstanceUid') ?? ''),
    studyInstance: String(getValue('studyInstance') ?? getValue('study_instance') ?? ''),
    requestingPhysician: String(getValue('requestingPhysician') ?? getValue('requesting_physician') ?? ''),
    referringPhysicianName: String(getValue('referringPhysicianName') ?? getValue('referring_physician_name') ?? ''),
    institutionName: String(getValue('institutionName') ?? getValue('institution_name') ?? ''),
    patientId: String(getValue('patientId') ?? getValue('patient_id') ?? ''),
    patientName: String(getValue('patientName') ?? getValue('patient_name') ?? ''),
    patientBirthDate: String(getValue('patientBirthDate') ?? getValue('patient_birth_date') ?? ''),
    patientSex: String(getValue('patientSex') ?? getValue('patient_sex') ?? ''),
    patientOtherIds: String(getValue('patientOtherIds') ?? getValue('patient_other_ids') ?? ''),
    notes: String(getValue('notes') ?? getValue('description') ?? getValue('studyDescription') ?? ''),
  };
};
