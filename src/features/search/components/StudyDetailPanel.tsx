"use client";

import { StudyItem } from '@/features/search/types';

interface StudyDetailPanelProps {
  activeItem: StudyItem | null;
  onClose: () => void;
}

export default function StudyDetailPanel({ activeItem, onClose }: StudyDetailPanelProps) {
  if (!activeItem) return null;

  const detailFields = [
    { label: '검사 날짜', value: activeItem.studyDate },
    { label: '검사 시간', value: activeItem.studyTime },
    { label: '접수 번호', value: activeItem.accessionNumber },
    { label: '검사 ID', value: activeItem.studyId },
    { label: 'Study Instance', value: activeItem.studyInstance },
    { label: '의뢰 의사', value: activeItem.requestingPhysician },
    { label: '의뢰 의사명', value: activeItem.referringPhysicianName },
    { label: '기관명', value: activeItem.institutionName },
    { label: '환자 ID', value: activeItem.patientId },
    { label: '환자명', value: activeItem.patientName },
    { label: '생년월일', value: activeItem.patientBirthDate },
    { label: '성별', value: activeItem.patientSex },
    { label: '기타 ID', value: activeItem.patientOtherIds },
    { label: '비고', value: activeItem.notes },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">{activeItem.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {detailFields.map((field) => (
              <div key={field.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-xs font-medium text-slate-500">{field.label}</p>
                <p className="text-sm font-medium text-slate-900 break-words">{field.value || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
