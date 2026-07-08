"use client";

import React, { useEffect, useState } from 'react';
import SeriesSidebar from './SeriesSidebar';
import AIResultSidebar from './AIResultSidebar';
import Toolbar from './Toolbar';
import DicomViewer from './DicomViewer';
import Header from '@/components/layout/Header';
import ReportModal from './ReportModal';
import { useDicomFileDrop } from '../hooks/useDicomFileDrop';

export default function ViewerLayout({ studyId }: { studyId?: string }) {
  const { handleFiles } = useDicomFileDrop();
  const [isLoadingStudy, setIsLoadingStudy] = useState(false);

  useEffect(() => {
    if (!studyId) return;

    const loadStudyData = async () => {
      setIsLoadingStudy(true);
      try {
        const response = await fetch(`/api/viewer/studies/${studyId}`);
        if (!response.ok) {
          console.error("Failed to fetch study data");
          return;
        }

        const data = await response.json();
        
        // Swagger 'StudyMetadataResponse' 구조를 바탕으로 pixelDataUrl 추출
        const urls: string[] = [];
        if (data.seriesList) {
          data.seriesList.forEach((series: any) => {
            if (series.instances) {
              series.instances.forEach((instance: any) => {
                if (instance.pixelDataUrl) {
                  urls.push(instance.pixelDataUrl);
                }
              });
            }
          });
        }

        if (urls.length === 0) {
          console.warn("No DICOM URLs found in the study data");
          setIsLoadingStudy(false);
          return;
        }

        // URL들을 File 객체로 변환
        const files: File[] = [];
        for (const url of urls) {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          const filename = url.split('/').pop() || 'image.dcm';
          const blob = new Blob([arrayBuffer], { type: 'application/dicom' });
          files.push(new File([blob], filename, { type: 'application/dicom' }));
        }

        // 기존의 DicomViewer 파싱 로직 태우기
        await handleFiles(files);
      } catch (error) {
        console.error("Error loading study:", error);
      } finally {
        setIsLoadingStudy(false);
      }
    };

    loadStudyData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyId]);

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden font-sans relative">
      <Header />

      {isLoadingStudy && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center text-white text-xl">
          스터디 데이터를 불러오는 중입니다...
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SeriesSidebar />

        {/* Center: Toolbar & Viewport */}
        <div className="flex-1 flex flex-col min-w-0 bg-black relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 mt-2 shadow-lg rounded-lg">
             <Toolbar />
          </div>
          <div className="flex-1 p-2 pb-0 flex flex-col">
            <DicomViewer />
          </div>
        </div>

        {/* Right Sidebar */}
        <AIResultSidebar />
      </div>

      {/* Report Modal */}
      <ReportModal />
    </div>
  );
}
