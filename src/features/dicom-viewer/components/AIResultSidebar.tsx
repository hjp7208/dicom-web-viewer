"use client";

import React, { useState } from 'react';
import { useViewerStore } from '@/features/dicom-viewer/store/useViewerStore';
import { useThemeStore } from '@/features/theme/useThemeStore';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function AIResultSidebar() {
  const { showAiOverlay, toggleAiOverlay, currentSliceIndex, currentSeriesName, aiResults, activeSeriesUID, memoText, setMemoText, setIsReportModalOpen, triggerJumpSlice } = useViewerStore();
  const { isDark } = useThemeStore();

  const currentAiResults = activeSeriesUID ? (aiResults[activeSeriesUID] || []) : [];
  const [currentAiIdx, setCurrentAiIdx] = useState(0);

  const navigateToSlice = (sliceIndex: number) => {
    triggerJumpSlice(sliceIndex);
  };

  const handleAiThumbnailClick = (idx: number, sliceIndex: number) => {
    setCurrentAiIdx(idx);
    navigateToSlice(sliceIndex);
  };

  const handlePrevAi = () => {
    if (currentAiIdx > 0) {
      const newIdx = currentAiIdx - 1;
      setCurrentAiIdx(newIdx);
      navigateToSlice(currentAiResults[newIdx].sliceIndex);
    }
  };

  const handleNextAi = () => {
    if (currentAiIdx < currentAiResults.length - 1) {
      const newIdx = currentAiIdx + 1;
      setCurrentAiIdx(newIdx);
      navigateToSlice(currentAiResults[newIdx].sliceIndex);
    }
  };

  const handleJumpToAi = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(e.currentTarget.value);
      if (!isNaN(val) && val >= 1 && val <= currentAiResults.length) {
        const newIdx = val - 1;
        setCurrentAiIdx(newIdx);
        navigateToSlice(currentAiResults[newIdx].sliceIndex);
      }
    }
  };

  const insertContextTag = () => {
    const tag = `[${currentSeriesName || 'Series 1'} - Slice: ${currentSliceIndex + 1}]`;
    setMemoText(memoText + (memoText.length > 0 ? '\n' : '') + tag + ' ');
  };

  const handleMemoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '@') {
      e.preventDefault();
      insertContextTag();
    }
  };

  return (
      <div className={`w-80 border-l flex flex-col h-full overflow-hidden ${isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-slate-200"}`}>
        <div className={`p-4 border-b shrink-0 ${isDark ? "border-neutral-800" : "border-slate-200"}`}>
          <h2 className={`font-semibold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            AI 분석 결과
            <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-red-500/20 text-red-400" : "bg-red-50 text-red-600"}`}>
            {currentAiResults.length}건
          </span>
          </h2>
        </div>

        {/* AI Thumbnails */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentAiResults.length === 0 && (
              <div className={`text-center text-sm mt-10 ${isDark ? "text-neutral-500" : "text-slate-400"}`}>
                DICOM 파일을 업로드하면 AI 분석 결과가 표시됩니다.
              </div>
          )}
          {currentAiResults.map((result, idx) => (
              <div
                  key={result.id}
                  onClick={() => handleAiThumbnailClick(idx, result.sliceIndex)}
                  className={`relative w-full aspect-square bg-black border-2 rounded-lg cursor-pointer overflow-hidden transition-colors ${
                      currentAiIdx === idx
                          ? 'border-red-500'
                          : isDark ? "border-neutral-700 hover:border-neutral-500" : "border-slate-200 hover:border-slate-400"
                  }`}
              >
                {result.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={result.thumbnailUrl}
                        alt="AI Thumbnail"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 pointer-events-none p-4 text-center">
                      <span className="text-xl font-bold text-neutral-400 mb-2">추론 png</span>
                      <span className="text-sm">(대표 슬라이스 {result.sliceIndex + 1})</span>
                      <span className="text-xs mt-2">클릭 시 이동</span>
                    </div>
                )}
                {result.lesion.width > 0 && (
                    <div
                        className="absolute border border-red-500 bg-red-500/20 pointer-events-none"
                        style={{
                          left: result.lesion.x, top: result.lesion.y,
                          width: result.lesion.width, height: result.lesion.height
                        }}
                    />
                )}
              </div>
          ))}
        </div>

        {/* Controls & Overlay Toggle */}
        <div className={`p-4 border-t shrink-0 ${isDark ? "border-neutral-800 bg-neutral-950" : "border-slate-200 bg-slate-50"}`}>
          <div className="mb-4">
            <button
                type="button"
                onClick={toggleAiOverlay}
                className="inline-flex items-center gap-3 cursor-pointer select-none focus:outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div
                  className={`flex items-center h-6 w-11 shrink-0 rounded-full px-0.5 transition-colors duration-300 ease-in-out ${
                      showAiOverlay ? 'bg-red-500' : isDark ? 'bg-neutral-600' : 'bg-slate-300'
                  }`}
              >
                <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ease-in-out shadow-sm ${
                        showAiOverlay ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </div>

              <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
              병변 오버레이
            </span>
            </button>
          </div>

          <div className={`flex items-center justify-center gap-4 rounded-lg p-2 border ${
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-slate-200"
          }`}>
            <button
                onClick={handlePrevAi}
                disabled={currentAiIdx === 0 || currentAiResults.length === 0}
                className={`p-1 disabled:opacity-30 transition-colors ${isDark ? "text-neutral-400 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}
            >
              <ChevronLeft />
            </button>

            <div className={`flex items-center gap-2 text-sm ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
              <input
                  type="text"
                  defaultValue={currentAiResults.length > 0 ? currentAiIdx + 1 : 0}
                  key={currentAiIdx}
                  onKeyDown={handleJumpToAi}
                  disabled={currentAiResults.length === 0}
                  className={`w-8 text-center border rounded py-1 focus:outline-none focus:border-blue-500 disabled:opacity-50 ${
                      isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-slate-100 border-slate-200 text-slate-900"
                  }`}
              />
              <span>/ {currentAiResults.length}</span>
            </div>

            <button
                onClick={handleNextAi}
                disabled={currentAiIdx === currentAiResults.length - 1 || currentAiResults.length === 0}
                className={`p-1 disabled:opacity-30 transition-colors ${isDark ? "text-neutral-400 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* Findings Memo */}
        <div className={`h-1/3 min-h-[250px] border-t p-4 flex flex-col ${
            isDark ? "border-neutral-800 bg-neutral-900" : "border-slate-200 bg-white"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold text-sm flex items-center gap-2 ${isDark ? "text-neutral-100" : "text-slate-800"}`}>
      <span className={`flex items-center justify-center w-6 h-6 rounded-md ${
          isDark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"
      }`}>
        <FileText className="w-3.5 h-3.5" />
      </span>
              소견 메모
            </h3>
            <button
                onClick={insertContextTag}
                className={`text-xs px-2.5 py-1.5 rounded-md transition-colors font-medium border ${
                    isDark
                        ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                }`}
                title="'@' 키를 눌러도 자동 삽입됩니다."
            >
              + 컨텍스트 태그 삽입
            </button>
          </div>
          <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              onKeyDown={handleMemoKeyDown}
              placeholder="여기에 소견을 입력하세요. '@' 입력 시 현재 시리즈/슬라이스 번호가 자동 태깅됩니다."
              className={`flex-1 w-full rounded-lg p-3 text-sm resize-none focus:outline-none transition-colors border ${
                  isDark
                      ? "bg-neutral-800/60 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:bg-neutral-800 focus:border-blue-500/50"
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-400"
              }`}
          />
          <button
              onClick={() => setIsReportModalOpen(true)}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm shadow-blue-600/20"
          >
            판독 소견서 작성 완료
          </button>
        </div>

      </div>
  );
}