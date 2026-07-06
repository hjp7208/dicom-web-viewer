"use client";

import React from 'react';
import { Upload } from 'lucide-react';
import { useViewerStore } from '../store/useViewerStore';
import { useDicomFileDrop } from '../hooks/useDicomFileDrop';
import { DicomViewport } from './DicomViewport';

export default function DicomViewer() {
  const { 
    viewportLayout, 
    loadedSeries, 
    activeViewportId,
    setActiveViewportId,
    viewportSeriesMap,
    setCurrentSeriesName,
    setTotalSlices
  } = useViewerStore();

  const { isDragging, isParsing, onDragOver, onDragLeave, onDrop } = useDicomFileDrop();

  const handleViewportClick = (viewportId: string) => {
    setActiveViewportId(viewportId);
    const seriesUID = viewportSeriesMap[viewportId];
    if (seriesUID) {
      const series = loadedSeries.find(s => s.seriesUID === seriesUID);
      if (series) {
        setCurrentSeriesName(series.series.seriesDescription);
        setTotalSlices(series.imageIds.length);
      }
    }
  };

  const getGridClasses = () => {
    switch(viewportLayout) {
      case '1x2': return 'grid-cols-2 grid-rows-1';
      case '2x2': return 'grid-cols-2 grid-rows-2';
      case '1x1':
      default: return 'grid-cols-1 grid-rows-1';
    }
  };

  const numViewports = viewportLayout === '2x2' ? 4 : (viewportLayout === '1x2' ? 2 : 1);

  return (
    <div className="flex-1 w-full bg-neutral-900 rounded-lg overflow-hidden shadow-2xl relative flex flex-col">
      {loadedSeries.length === 0 ? (
        <div 
          className={`flex-1 flex flex-col items-center justify-center p-12 transition-colors duration-300 ${
            isDragging ? 'bg-neutral-800/80 border-2 border-dashed border-blue-500 m-2' : 'bg-transparent border-2 border-dashed border-neutral-700 m-2'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
            <Upload className={`w-10 h-10 ${isDragging ? 'text-blue-500' : 'text-neutral-400'}`} />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            {isParsing ? 'Parsing DICOM...' : 'Drag & Drop DICOM Files or Folder'}
          </h3>
          <p className="text-neutral-400 text-center mb-8 max-w-md">
             {isParsing ? '파일을 분석 중입니다. 잠시만 기다려주세요.' : '테스트를 위해 여러 .dcm 파일 또는 폴더를 여기에 드롭하세요.'}
          </p>
        </div>
      ) : (
        <div className={`flex-1 grid gap-1 p-1 bg-black ${getGridClasses()}`}>
          {Array.from({ length: numViewports }).map((_, idx) => {
            const vpId = `dicom_viewport_${idx}`;
            const seriesUID = viewportSeriesMap[vpId];
            const series = loadedSeries.find(s => s.seriesUID === seriesUID) || null;
            
            return (
              <DicomViewport 
                key={`viewport-${idx}`} 
                viewportId={vpId} 
                series={series} 
                isActive={activeViewportId === vpId}
                onClick={() => handleViewportClick(vpId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
