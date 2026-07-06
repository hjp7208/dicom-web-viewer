"use client";

import React, { useCallback } from 'react';
import Link from 'next/link';
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
      <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-bold tracking-widest text-blue-500 hover:opacity-80 transition-opacity">DICOM</Link>
          
          <nav className="flex items-center gap-2">
            <Link href="/" className="px-4 py-2 rounded-md bg-neutral-800 text-white font-medium text-sm transition-all shadow-sm">
              뷰어
            </Link>
            <Link href="/search" className="px-4 py-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800/50 font-medium text-sm transition-all">
              검색
            </Link>
            <Link href="/dashboard" className="px-4 py-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800/50 font-medium text-sm transition-all">
              대시보드
            </Link>
          </nav>
        </div>
        
        {/* Profile Placeholder */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-sm border border-neutral-700 cursor-pointer hover:opacity-80 transition-opacity"></div>
        </div>
      </header>

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
