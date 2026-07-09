"use client";

import { useState, useEffect } from 'react';
import { StudyItem } from '@/features/studies/types';
import Link from 'next/link';

interface StudyDetailPanelProps {
  activeItem: StudyItem | null;
  onClose: () => void;
}

/**
 * 선택된 검사 항목의 상세 정보를 모달 형태로 표시하는 패널 컴포넌트입니다.
 * 필요한 경우 /api/studies/{id}/metadata 엔드포인트를 호출하여 추가 메타데이터를 가져오고 결합합니다.
 */
export default function StudyDetailPanel({ activeItem, onClose }: StudyDetailPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeItem?.id) return;
    
    const fetchMetadata = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/studies/${activeItem.id}/metadata`, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        }
      } catch (e) {
        console.error('Failed to fetch metadata', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetadata();
  }, [activeItem?.id]);

  if (!activeItem) return null;

  // 선택된 항목의 기본 데이터와 패칭된 메타데이터를 병합합니다. (데이터가 없을 시 임시 Mock 데이터 사용)
  const mergedData = {
    studyDate: activeItem.studyDate || metadata?.study?.date || '-',
    studyTime: activeItem.studyTime || metadata?.study?.time || '-',
    accessionNumber: activeItem.accessionNumber || metadata?.study?.accessionNumber || 'ACC-MOCK-001',
    studyId: activeItem.studyId || metadata?.study?.id || '-',
    studyInstance: activeItem.studyInstance || metadata?.studyInstanceUid || '-',
    requestingPhysician: activeItem.requestingPhysician || 'Dr. Mock Requesting',
    referringPhysicianName: activeItem.referringPhysicianName || metadata?.study?.referringPhysicianName || 'Dr. Mock Referring',
    institutionName: activeItem.institutionName || metadata?.study?.institutionName || 'Mock Hospital',
    patientId: activeItem.patientId || metadata?.patient?.id || '-',
    patientName: activeItem.patientName || metadata?.patient?.name || '-',
    patientBirthDate: activeItem.patientBirthDate || metadata?.patient?.birthDate || '-',
    patientSex: activeItem.patientSex || metadata?.patient?.sex || '-',
    patientOtherIds: activeItem.patientOtherIds || 'OTHER-MOCK-ID',
    notes: activeItem.notes || metadata?.study?.description || activeItem.title || '-',
  };

  const detailFields = [
    { label: '검사 날짜', value: mergedData.studyDate },
    { label: '검사 시간', value: mergedData.studyTime },
    { label: '접수 번호', value: mergedData.accessionNumber },
    { label: '검사 ID', value: mergedData.studyId },
    { label: 'Study Instance', value: mergedData.studyInstance },
    { label: '의뢰 의사', value: mergedData.requestingPhysician },
    { label: '의뢰 의사명', value: mergedData.referringPhysicianName },
    { label: '기관명', value: mergedData.institutionName },
    { label: '환자 ID', value: mergedData.patientId },
    { label: '환자명', value: mergedData.patientName },
    { label: '생년월일', value: mergedData.patientBirthDate },
    { label: '성별', value: mergedData.patientSex },
    { label: '기타 ID', value: mergedData.patientOtherIds },
    { label: '비고', value: mergedData.notes },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">
            {activeItem.title} {loading && <span className="text-sm font-normal text-slate-400 ml-2">(로딩 중...)</span>}
          </h2>
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors"
          >
            닫기
          </button>
          <Link
            href={`/?studyId=${activeItem.id}`}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            뷰어로 열기
          </Link>
        </div>
      </div>
    </div>
  );
}
