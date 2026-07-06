"use client";

import React, { useCallback } from 'react';
import SeriesSidebar from './SeriesSidebar';
import AIResultSidebar from './AIResultSidebar';
import Toolbar from './Toolbar';
import DicomViewer from './DicomViewer';
import Header from '@/components/layout/Header';
import { useViewerStore } from '@/features/dicom-viewer/store/useViewerStore';

export default function ViewerLayout() {
  const { currentSliceIndex, totalSlices } = useViewerStore();


  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden font-sans">
      <Header />

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
    </div>
  );
}
