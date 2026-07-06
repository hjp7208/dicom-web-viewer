"use client";

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
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
  );
}
