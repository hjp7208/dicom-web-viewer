"use client";

import React, { useState } from 'react';
import { useViewerStore } from '@/features/dicom-viewer/store/useViewerStore';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function AIResultSidebar() {
  const { showAiOverlay, toggleAiOverlay, currentSliceIndex, currentSeriesName, aiResults, memoText, setMemoText, setIsReportModalOpen } = useViewerStore();
  
  // Local state for the AI slices navigation
  const [currentAiIdx, setCurrentAiIdx] = useState(0);

  const navigateToSlice = (sliceIndex: number) => {
    // Trigger custom event to tell DicomViewer to jump to slice
    window.dispatchEvent(new CustomEvent('dicom-jump-slice', { detail: { sliceIndex } }));
  };

  const handleAiThumbnailClick = (idx: number, sliceIndex: number) => {
    setCurrentAiIdx(idx);
    navigateToSlice(sliceIndex);
  };

  const handlePrevAi = () => {
    if (currentAiIdx > 0) {
      const newIdx = currentAiIdx - 1;
      setCurrentAiIdx(newIdx);
      navigateToSlice(aiResults[newIdx].sliceIndex);
    }
  };

  const handleNextAi = () => {
    if (currentAiIdx < aiResults.length - 1) {
      const newIdx = currentAiIdx + 1;
      setCurrentAiIdx(newIdx);
      navigateToSlice(aiResults[newIdx].sliceIndex);
    }
  };

  const handleJumpToAi = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(e.currentTarget.value);
      if (!isNaN(val) && val >= 1 && val <= aiResults.length) {
        const newIdx = val - 1;
        setCurrentAiIdx(newIdx);
        navigateToSlice(aiResults[newIdx].sliceIndex);
      }
    }
  };

  const insertContextTag = () => {
    const tag = `[${currentSeriesName || 'Series 1'} - Slice: ${currentSliceIndex + 1}]`;
    setMemoText(memoText + (memoText.length > 0 ? '\n' : '') + tag + ' ');
  };

  // Allow auto-tag by pressing '@' in text area (basic implementation)
  const handleMemoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '@') {
      e.preventDefault();
      insertContextTag();
    }
  };

  return (
    <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-neutral-800 shrink-0">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          AI 분석 결과
          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
            {aiResults.length}건
          </span>
        </h2>
      </div>

      {/* AI Thumbnails */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {aiResults.length === 0 && (
          <div className="text-neutral-500 text-center text-sm mt-10">
            DICOM 파일을 업로드하면 AI 분석 결과가 표시됩니다.
          </div>
        )}
        {aiResults.map((result, idx) => (
          <div 
            key={result.id}
            onClick={() => handleAiThumbnailClick(idx, result.sliceIndex)}
            className={`relative w-full aspect-square bg-black border-2 rounded-lg cursor-pointer overflow-hidden transition-colors ${
              currentAiIdx === idx ? 'border-red-500' : 'border-neutral-700 hover:border-neutral-500'
            }`}
          >
            {/* Mock Thumbnail Image text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 pointer-events-none p-4 text-center">
              <span className="text-xl font-bold text-neutral-400 mb-2">추론 png</span>
              <span className="text-sm">(대표 슬라이스 {result.sliceIndex + 1})</span>
              <span className="text-xs mt-2">클릭 시 이동</span>
            </div>
            {/* Red box mock in thumbnail */}
            <div 
              className="absolute border border-red-500 bg-red-500/20 pointer-events-none"
              style={{
                left: result.lesion.x, top: result.lesion.y, 
                width: result.lesion.width, height: result.lesion.height
              }}
            />
          </div>
        ))}
      </div>

      {/* Controls & Overlay Toggle */}
      <div className="p-4 border-t border-neutral-800 shrink-0 bg-neutral-950">
        <div className="mb-4">
          <button 
            type="button"
            onClick={toggleAiOverlay}
            className="inline-flex items-center gap-3 cursor-pointer select-none focus:outline-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Flexbox-based Toggle (Guarantees perfect vertical/horizontal alignment without subpixel offsets) */}
            <div 
              className={`flex items-center h-6 w-11 shrink-0 rounded-full px-0.5 transition-colors duration-300 ease-in-out ${
                showAiOverlay ? 'bg-red-500' : 'bg-neutral-600'
              }`}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm ${
                  showAiOverlay ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
            
            <span className="text-sm font-medium text-white">
              병변 오버레이
            </span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 bg-neutral-900 rounded-lg p-2 border border-neutral-800">
          <button 
            onClick={handlePrevAi}
            disabled={currentAiIdx === 0 || aiResults.length === 0}
            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <input 
              type="text" 
              defaultValue={aiResults.length > 0 ? currentAiIdx + 1 : 0}
              key={currentAiIdx} // re-render on change
              onKeyDown={handleJumpToAi}
              disabled={aiResults.length === 0}
              className="w-8 text-center bg-neutral-800 border border-neutral-700 rounded text-white py-1 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <span>/ {aiResults.length}</span>
          </div>

          <button 
            onClick={handleNextAi}
            disabled={currentAiIdx === aiResults.length - 1 || aiResults.length === 0}
            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Findings Memo */}
      <div className="h-1/3 min-h-[250px] border-t border-neutral-800 p-4 flex flex-col bg-[#eef0d8] text-neutral-900">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold flex items-center gap-2">
            <FileText className="w-4 h-4" /> 소견 메모
          </h3>
          <button 
            onClick={insertContextTag}
            className="text-xs bg-black/10 hover:bg-black/20 px-2 py-1 rounded transition-colors font-medium"
            title="'@' 키를 눌러도 자동 삽입됩니다."
          >
            컨텍스트 태그 삽입
          </button>
        </div>
        <textarea
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          onKeyDown={handleMemoKeyDown}
          placeholder="여기에 소견을 입력하세요. '@' 입력 시 현재 시리즈/슬라이스 번호가 자동 태깅됩니다."
          className="flex-1 w-full bg-white/50 border border-black/10 rounded-md p-3 resize-none focus:outline-none focus:bg-white transition-colors"
        />
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="mt-3 w-full bg-neutral-800 hover:bg-neutral-900 text-white py-2 rounded-md font-medium transition-colors text-sm"
        >
          판독 소견서 작성 완료
        </button>
      </div>

    </div>
  );
}
