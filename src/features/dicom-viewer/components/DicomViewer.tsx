"use client";

import React, { useRef } from 'react';
import { Upload, Folder, File as FileIcon, Loader2 } from 'lucide-react';
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
    setTotalSlices,
    setActiveSeriesUID
  } = useViewerStore();

  const { isDragging, isParsing, isUnzipping, uploadProgress, onDragOver, onDragLeave, onDrop, handleFiles } = useDicomFileDrop();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
      e.target.value = ''; // Reset input so the same files can be selected again
    }
  };

  const handleViewportClick = (viewportId: string) => {
    setActiveViewportId(viewportId);
    const seriesUID = viewportSeriesMap[viewportId];
    if (seriesUID) {
      setActiveSeriesUID(seriesUID);
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
    <div className="flex-1 w-full relative flex flex-col h-full">
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
            {(isUnzipping && uploadProgress <= 15) ? (
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            ) : (
              <Upload className={`w-10 h-10 ${isDragging ? 'text-blue-500' : 'text-neutral-400'} ${isUnzipping ? 'animate-bounce' : ''}`} />
            )}
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            {isUnzipping && uploadProgress <= 15 ? 'Analyzing ZIP Structure...' 
              : (isUnzipping ? 'Extracting ZIP Files...' 
              : (isParsing ? 'Parsing DICOM...' : 'Drag & Drop DICOM Files or Folder'))}
          </h3>
          <p className="text-neutral-400 text-center mb-8 max-w-md">
            {isUnzipping && uploadProgress <= 15 ? '압축 파일의 구조를 분석 중입니다. 잠시만 기다려주세요...'
              : (isUnzipping ? '압축 파일을 해제 중입니다. 파일 크기에 따라 다소 시간이 걸릴 수 있습니다.' 
              : (isParsing ? '파일을 분석 중입니다. 잠시만 기다려주세요.' : '테스트를 위해 여러 .dcm 파일 또는 폴더를 여기에 드롭하거나 아래 버튼을 통해 선택하세요.'))}
          </p>

          {(isParsing || isUnzipping) && (
            <div className="w-full max-w-md mb-8">
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                {isUnzipping && uploadProgress <= 15 ? (
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                ) : (
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                )}
              </div>
              <div className="text-center mt-2 text-sm text-neutral-400">
                {isUnzipping && uploadProgress <= 15 
                  ? `Analyzing... ${uploadProgress}%` 
                  : (isUnzipping ? `Extracting... ${uploadProgress}%` : `${uploadProgress}%`)}
              </div>
            </div>
          )}

          {(!isParsing && !isUnzipping) && (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
              >
                <FileIcon className="w-5 h-5" /> 파일 선택
              </button>
              <button 
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors shadow-lg"
              >
                <Folder className="w-5 h-5" /> 폴더 선택
              </button>
            </div>
          )}

          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={onFileChange} 
            className="hidden" 
            accept=".dcm,application/dicom,.zip,application/zip" 
          />
          <input 
            type="file" 
            // @ts-expect-error - webkitdirectory is a non-standard but widely supported attribute
            webkitdirectory="true" 
            directory="true" 
            multiple 
            ref={folderInputRef} 
            onChange={onFileChange} 
            className="hidden" 
          />
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
