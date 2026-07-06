"use client";

import React, { useEffect, useRef } from 'react';
import { useViewerStore } from '@/lib/useViewerStore';
import * as cornerstone from '@cornerstonejs/core';
import { SeriesData } from '@/lib/dicomParserUtil';

const Thumbnail = ({ imageId, id }: { imageId: string, id: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imageId) return;

    const initThumb = async () => {
      let engine = cornerstone.getRenderingEngine('thumbnail_engine');
      if (!engine) {
        engine = new cornerstone.RenderingEngine('thumbnail_engine');
      }

      const viewportId = `thumb_${id}`;
      
      const viewportInput = {
        viewportId,
        type: cornerstone.Enums.ViewportType.STACK,
        element: containerRef.current!,
        defaultOptions: {
          background: [0, 0, 0] as cornerstone.Types.Point3,
        },
      };
      
      engine.enableElement(viewportInput);
      const viewport = engine.getViewport(viewportId) as cornerstone.Types.IStackViewport;
      
      await viewport.setStack([imageId], 0);
      viewport.render();
    };

    initThumb();

    return () => {
      const e = cornerstone.getRenderingEngine('thumbnail_engine');
      if (e) e.disableElement(`thumb_${id}`);
    };
  }, [imageId, id]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black" />;
};

export default function SeriesSidebar() {
  const { 
    loadedSeries, 
    activeViewportId, 
    viewportSeriesMap, 
    setViewportSeriesMap,
    setCurrentSeriesName,
    setTotalSlices
  } = useViewerStore();

  const handleSeriesClick = (series: SeriesData) => {
    setViewportSeriesMap(activeViewportId, series.seriesUID);
    setCurrentSeriesName(series.series?.seriesDescription || '');
    setTotalSlices(series.imageIds.length);
  };

  // Group by date (Study 단위)
  const groupedSeries = loadedSeries.reduce((acc, series) => {
    const date = series.study?.date || 'Unknown Date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(series);
    return acc;
  }, {} as Record<string, SeriesData[]>);

  if (loadedSeries.length === 0) {
    return (
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full p-4 items-center justify-center text-neutral-400 text-sm text-center">
        DICOM 파일을 우측 캔버스에<br/>드래그 앤 드롭 하세요.
      </div>
    );
  }

  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full overflow-y-auto">
      {Object.entries(groupedSeries).map(([date, seriesList]) => (
        <div key={date} className="mb-4">
          <div className="text-xs text-neutral-400 font-medium px-4 py-2 bg-neutral-800/50">
            Date: {date}
          </div>
          <div className="p-4 space-y-4">
            {seriesList.map((series, idx) => {
              const isActive = Object.values(viewportSeriesMap).includes(series.seriesUID);
              // 대표 이미지는 시리즈의 첫번째 이미지 사용
              const repImageId = series.imageIds[0];

              return (
                <div 
                  key={series.seriesUID}
                  onClick={() => handleSeriesClick(series)}
                  className={`relative rounded-lg shadow-sm flex flex-col cursor-pointer transition-all overflow-hidden bg-black ${
                    isActive ? 'border-2 border-blue-500 aspect-[4/3]' : 'border-2 border-transparent aspect-[4/3] hover:border-neutral-400'
                  }`}
                >
                  {/* Thumbnail Rendering */}
                  {repImageId && (
                    <Thumbnail imageId={repImageId} id={series.seriesUID.replace(/[^a-zA-Z0-9]/g, '') + idx} />
                  )}
                  
                  {/* Overlay for text at the bottom center */}
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pointer-events-none">
                    <span className="text-white text-sm font-semibold truncate w-full text-center drop-shadow-md">
                      {['CR', 'DX', 'XR', 'XA', 'RF'].includes(series.series?.modality) 
                        ? `[${series.series?.modalitySpecific?.bodyPartExamined || 'XR'}] ${series.series?.modalitySpecific?.viewPosition || series.series?.seriesDescription || ''}`
                        : series.series?.seriesDescription || 'No Desc'}
                    </span>
                    <span className="text-white/80 text-xs font-medium drop-shadow-md">
                      {['CR', 'DX', 'XR', 'XA', 'RF'].includes(series.series?.modality) 
                        ? series.series.modality
                        : `${series.imageIds.length} slices`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
