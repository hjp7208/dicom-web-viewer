"use client";

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useViewerStore } from '@/features/dicom-viewer/store/useViewerStore';
import { SeriesData } from '@/features/dicom-viewer/utils/dicomParserUtil';
import * as cornerstone from '@cornerstonejs/core';

const Thumbnail = ({ imageId, id }: { imageId: string, id: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!isVisible || !containerRef.current || !imageId) return;

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
      
      if (!isMounted) {
        engine.disableElement(viewportId);
        return;
      }

      const viewport = engine.getViewport(viewportId) as cornerstone.Types.IStackViewport;
      
      try {
        await viewport.setStack([imageId], 0);
        if (isMounted) {
          viewport.render();
        }
      } catch (e) {
        console.error('Thumbnail render error:', e);
      }
    };

    initThumb();

    return () => {
      isMounted = false;
      const e = cornerstone.getRenderingEngine('thumbnail_engine');
      if (e) e.disableElement(`thumb_${id}`);
    };
  }, [imageId, id, isVisible]);

  // pointer-events-none prevents the Cornerstone canvas from capturing wheel/scroll events,
  // allowing the user to scroll the sidebar smoothly even when hovering over a thumbnail.
  return <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black pointer-events-none" />;
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

  const [selectedPatient, setSelectedPatient] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<string>('');

  const handleSeriesClick = (series: SeriesData) => {
    setViewportSeriesMap(activeViewportId, series.seriesUID);
    setCurrentSeriesName(series.series?.seriesDescription || '');
    setTotalSlices(series.imageIds.length);
  };

  const availablePatients = useMemo(() => {
    const map = new Map<string, string>();
    loadedSeries.forEach(s => {
      const sDate = s.study?.date || 'Unknown Date';
      if (selectedDate && sDate !== selectedDate) return;
      
      const id = s.patient?.id || 'Unknown ID';
      const name = s.patient?.name || 'Unknown Patient';
      if (!map.has(id)) {
        map.set(id, name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [loadedSeries, selectedDate]);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    loadedSeries.forEach(s => {
      const pId = s.patient?.id || 'Unknown ID';
      if (selectedPatient && pId !== selectedPatient) return;
      
      dates.add(s.study?.date || 'Unknown Date');
    });
    return Array.from(dates).sort();
  }, [loadedSeries, selectedPatient]);

  const filteredSeries = useMemo(() => {
    return loadedSeries.filter(series => {
      const pId = series.patient?.id || 'Unknown ID';
      const sDate = series.study?.date || 'Unknown Date';
      if (selectedPatient && pId !== selectedPatient) return false;
      if (selectedDate && sDate !== selectedDate) return false;
      return true;
    });
  }, [loadedSeries, selectedPatient, selectedDate]);

  // Group by date (Study 단위)
  const groupedSeries = useMemo(() => {
    return filteredSeries.reduce((acc, series) => {
      const date = series.study?.date || 'Unknown Date';
      if (!acc[date]) acc[date] = [];
      acc[date].push(series);
      return acc;
    }, {} as Record<string, SeriesData[]>);
  }, [filteredSeries]);

  if (loadedSeries.length === 0) {
    return (
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full p-4 items-center justify-center text-neutral-400 text-sm text-center">
        DICOM 파일을 우측 캔버스에<br/>드래그 앤 드롭 하세요.
      </div>
    );
  }

  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
      {/* Filters */}
      <div className="p-3 border-b border-neutral-800 flex flex-col gap-2 shrink-0 bg-neutral-900">
        <select 
          value={selectedPatient} 
          onChange={(e) => setSelectedPatient(e.target.value)}
          className="w-full bg-neutral-800 text-sm text-neutral-300 border border-neutral-700 rounded-md p-1.5 focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">All Patients</option>
          {availablePatients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
        </select>
        <select 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-neutral-800 text-sm text-neutral-300 border border-neutral-700 rounded-md p-1.5 focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">All Dates</option>
          {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Series List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(groupedSeries).map(([date, seriesList]) => (
          <div key={date} className="border border-neutral-700 rounded-lg overflow-hidden bg-neutral-900/50">
            <div className="bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 border-b border-neutral-700">
              Date: {date}
            </div>
            <div className="p-2 space-y-3">
              {(seriesList as SeriesData[]).map((series: SeriesData, idx: number) => {
                const isActive = Object.values(viewportSeriesMap).includes(series.seriesUID);
                // 대표 이미지는 시리즈의 첫번째 이미지 사용
                const repImageId = series.imageIds[0];

                return (
                  <div 
                    key={series.seriesUID}
                    onClick={() => handleSeriesClick(series)}
                    className={`relative rounded-lg shadow-sm flex flex-col cursor-pointer transition-all overflow-hidden bg-black ${
                      isActive ? 'border-2 border-blue-500 aspect-[4/3]' : 'border-2 border-transparent aspect-[4/3] hover:border-neutral-500'
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
    </div>
  );
}
