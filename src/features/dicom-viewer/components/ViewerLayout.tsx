"use client";

import React, { useEffect, useState } from 'react';
import SeriesSidebar from './SeriesSidebar';
import AIResultSidebar from './AIResultSidebar';
import Toolbar from './Toolbar';
import DicomViewer from './DicomViewer';
import ReportModal from './ReportModal';
import { useViewerStore } from '../store/useViewerStore';
import { useThemeStore } from '@/features/theme/useThemeStore';
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

export default function ViewerLayout({ studyId }: { studyId?: string }) {

  const {
    loadedSeries,
    setLoadedSeries,
    activeViewportId,
    setViewportSeriesMap,
    setActiveSeriesUID,
    setCurrentSeriesName,
    setTotalSlices,
    setAiResults,
    setCurrentDbStudyId,
    resetViewer
  } = useViewerStore();

  const { isDark } = useThemeStore();
  const [isLoadingStudy, setIsLoadingStudy] = useState(false);

  useEffect(() => {
    if (!studyId) return;

    const loadStudyData = async () => {
      resetViewer();
      if (studyId) {
        setCurrentDbStudyId(studyId);
      }
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

        const newLoadedSeries: SeriesData[] = data.seriesList.map((series: StudyMetadataSeries) => {
          const sortedInstances = (series.instances || []).sort((a: StudyMetadataInstance, b: StudyMetadataInstance) => (a.instanceNumber || 0) - (b.instanceNumber || 0));

          const files = sortedInstances.map((inst: StudyMetadataInstance) => ({
            file: new File([], inst.sopInstanceUid || 'dummy.dcm'),
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
              imageOrientation: inst.imageOrientation || [1, 0, 0, 0, 1, 0],
              sliceLocation: inst.sliceLocation || 0,
              pixelDataUrl: inst.pixelDataUrl,
              numberOfFrames: 1
            }
          }));

          const imageIds = sortedInstances.map((inst: StudyMetadataInstance) => `wadouri:${inst.pixelDataUrl}`);

          return {
            seriesUID: series.seriesInstanceUid || 'unknown_series',
            patient: files[0]?.patient,
            study: files[0]?.study,
            series: files[0]?.series,
            files,
            imageIds,
          } as SeriesData;
        });

        await initCornerstone();

        setLoadedSeries(newLoadedSeries);

        if (newLoadedSeries.length > 0) {
          const mainSeries = newLoadedSeries
            .filter(s => s.series.modality !== 'SC' && s.series.modality !== 'SR')
            .sort((a, b) => b.imageIds.length - a.imageIds.length)[0] || newLoadedSeries[0];

          setViewportSeriesMap(activeViewportId, mainSeries.seriesUID);
          setActiveSeriesUID(mainSeries.seriesUID);
          setCurrentSeriesName(mainSeries.series.seriesDescription || mainSeries.series.modality);
          setTotalSlices(mainSeries.imageIds.length);

          // 실제 AI 결과 서버에서 가져오기 (Next.js proxy route 사용)
          try {
            const reportRes = await fetch(`/api/reports/${studyId}`);

            if (reportRes.ok) {
              const reportData = await reportRes.json();
              if (reportData.scKey) {
                // S3키(또는 경로)를 preview API에 넘겨 PNG 썸네일을 받아옴
                const previewUrl = `/api/ai/preview?path=${encodeURIComponent(reportData.scKey)}`;
                // 실제 데이터를 스토어에 세팅
                const realAiResult = {
                  id: reportData.id.toString(),
                  sliceIndex: 0,
                  thumbnailUrl: previewUrl,
                  lesion: { x: 0, y: 0, width: 0, height: 0 },
                  findings: reportData.aiResultJson || '결과'
                };
                setAiResults(mainSeries.seriesUID, [realAiResult]);
              } else {
                setAiResults(mainSeries.seriesUID, []);
              }
            } else {
              setAiResults(mainSeries.seriesUID, []);
            }
          } catch (e) {
            console.error("AI 결과 로드 실패:", e);
            setAiResults(mainSeries.seriesUID, []);
          }
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
    <div className={`flex flex-col h-screen overflow-hidden font-sans relative ${isDark ? "bg-black" : "bg-white"}`}>
      {isLoadingStudy && (
        <div className={`absolute inset-0 z-50 flex items-center justify-center text-xl ${isDark ? "bg-black/80 text-white" : "bg-white/80 text-slate-900"
          }`}>
          스터디 데이터를 불러오는 중입니다...
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SeriesSidebar />
        {/* Center: Toolbar & Viewport */}
        <div className={`flex-1 flex flex-col min-w-0 relative ${isDark ? "bg-black" : "bg-slate-50"}`}>
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