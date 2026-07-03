"use client";

import React, { useCallback } from 'react';
import SeriesSidebar from './SeriesSidebar';
import AIResultSidebar from './AIResultSidebar';
import Toolbar from './Toolbar';
import DicomViewer from './DicomViewer';
import { useViewerStore } from '@/lib/useViewerStore';

export default function ViewerLayout() {
  const { currentSliceIndex, totalSlices } = useViewerStore();


  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-neutral-300 flex items-center px-6 shrink-0 z-10">
        <div className="flex items-center gap-8 text-neutral-900">
          <div className="bg-neutral-200 px-6 py-2 text-2xl font-bold rounded-sm">로고</div>
          <div className="text-3xl tracking-widest font-light">뷰어 검색 대시보드</div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SeriesSidebar />

        {/* Center: Toolbar & Viewport */}
        <div className="flex-1 flex flex-col min-w-0 bg-neutral-400 relative">
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
    </div>
  );
}
