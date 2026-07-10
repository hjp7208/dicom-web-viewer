"use client";

import React, { useEffect, useState } from 'react';
import SeriesSidebar from './SeriesSidebar';
import AIResultSidebar from './AIResultSidebar';
import Toolbar from './Toolbar';
import DicomViewer from './DicomViewer';
import Header from '@/components/layout/Header';
import ReportModal from './ReportModal';
import { useViewerStore } from '../store/useViewerStore';
import { generateMockAiResults } from '../utils/fileUploadUtil';
import { SeriesData } from '../utils/dicomParserUtil';
import initCornerstone from '../../../lib/cornerstoneInit';

interface StudyMetadataInstance {
  sopInstanceUid?: string;
  instanceNumber?: number;
  rows?: number;
  columns?: number;
  pixelSpacing?: number[];
  windowWidth?: number;
  windowLevel?: number;
  rescaleSlope?: number;
  rescaleIntercept?: number;
  imageOrientation?: number[];
  sliceLocation?: number;
  pixelDataUrl?: string;
}

interface StudyMetadataSeries {
  seriesInstanceUid?: string;
  seriesNumber?: number;
  seriesDescription?: string;
  modality?: string;
  modalitySpecific?: {
    imageLaterality?: string;
    viewPosition?: string;
    bodyPartExamined?: string;
    sliceThickness?: number;
  };
  instances?: StudyMetadataInstance[];
}

interface StudyMetadataResponse {
  studyInstanceUid?: string;
  patient?: {
    name?: string;
    id?: string;
    sex?: string;
    birthDate?: string;
    age?: string;
  };
  study?: {
    id?: string;
    date?: string;
    time?: string;
    description?: string;
    accessionNumber?: string;
    referringPhysicianName?: string;
    institutionName?: string;
  };
  seriesList?: StudyMetadataSeries[];
}

const toAbsoluteUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;
};

export default function ViewerLayout({ studyId }: { studyId?: string }) {
  const { 
    loadedSeries, 
    setLoadedSeries, 
    activeViewportId, 
    setViewportSeriesMap, 
    setActiveSeriesUID, 
    setCurrentSeriesName, 
    setTotalSlices, 
    setAiResults 
  } = useViewerStore();
  
  const [isLoadingStudy, setIsLoadingStudy] = useState(false);

  useEffect(() => {
    if (!studyId) return;

    const loadStudyData = async () => {
      setIsLoadingStudy(true);
      try {
        const response = await fetch(`/api/studies/${studyId}/metadata`);
        if (!response.ok) {
          console.error("Failed to fetch study data");
          return;
        }

        const data = (await response.json()) as StudyMetadataResponse;
        
        if (!data.seriesList || data.seriesList.length === 0) {
          console.warn("No DICOM series found in the study data");
          setIsLoadingStudy(false);
          return;
        }

        // 1. 직접 SeriesData 배열 생성 (Blob 변환 및 파일 생성 오버헤드 제거)
        const newLoadedSeries: SeriesData[] = data.seriesList.map((series) => {
          const sortedInstances = [...(series.instances || [])].sort(
            (a, b) => (a.instanceNumber || 0) - (b.instanceNumber || 0),
          );
          
          const files = sortedInstances.map((inst) => ({
            file: new File([], inst.sopInstanceUid || 'dummy.dcm'), // 메모리를 차지하지 않는 빈 파일 객체
            patient: {
              name: data.patient?.name || '',
              id: data.patient?.id || '',
              sex: data.patient?.sex || '',
              birthDate: data.patient?.birthDate || '',
              age: data.patient?.age || '',
            },
            study: {
              studyInstanceUid: data.studyInstanceUid || data.study?.id || '',
              id: data.study?.id || '',
              date: data.study?.date || '',
              time: data.study?.time || '',
              description: data.study?.description || '',
              accessionNumber: data.study?.accessionNumber || '',
              referringPhysicianName: data.study?.referringPhysicianName || '',
              institutionName: data.study?.institutionName || '',
            },
            series: {
              seriesInstanceUid: series.seriesInstanceUid || '',
              seriesNumber: series.seriesNumber || 1,
              seriesDescription: series.seriesDescription || '',
              modality: series.modality || '',
              modalitySpecific: series.modalitySpecific || {},
            },
            instance: {
              sopInstanceUid: inst.sopInstanceUid,
              instanceNumber: inst.instanceNumber,
              rows: inst.rows || 512,
              columns: inst.columns || 512,
              pixelSpacing: inst.pixelSpacing || [1, 1],
              windowWidth: inst.windowWidth || 400,
              windowLevel: inst.windowLevel || 40,
              rescaleSlope: inst.rescaleSlope || 1,
              rescaleIntercept: inst.rescaleIntercept || -1024,
              imageOrientation: inst.imageOrientation || [1,0,0,0,1,0],
              sliceLocation: inst.sliceLocation || 0,
              pixelDataUrl: inst.pixelDataUrl,
              numberOfFrames: 1
            }
          }));

          // Cornerstone에서 지연 로딩(Lazy Loading)을 위해 wadouri scheme 사용
          const imageIds = sortedInstances
            .map((inst) => inst.pixelDataUrl)
            .filter((url): url is string => Boolean(url))
            .map((url) => `wadouri:${toAbsoluteUrl(url)}`);

          return {
            seriesUID: series.seriesInstanceUid || 'unknown_series',
            patient: files[0]?.patient,
            study: files[0]?.study,
            series: files[0]?.series,
            files,
            imageIds,
          } as SeriesData;
        });

        // 2. Cornerstone 초기화 및 상태 업데이트
        await initCornerstone();
        
        const mergedSeries = [...loadedSeries];
        newLoadedSeries.forEach(ns => {
          if (!mergedSeries.find(s => s.seriesUID === ns.seriesUID)) {
            mergedSeries.push(ns);
          }
        });

        setLoadedSeries(mergedSeries);

        if (newLoadedSeries.length > 0) {
          const firstSeries = newLoadedSeries[0];
          setViewportSeriesMap(activeViewportId, firstSeries.seriesUID);
          setActiveSeriesUID(firstSeries.seriesUID);
          setCurrentSeriesName(firstSeries.series.seriesDescription);
          setTotalSlices(firstSeries.imageIds.length);
          
          setAiResults(firstSeries.seriesUID, generateMockAiResults(firstSeries.imageIds.length));
        }

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
