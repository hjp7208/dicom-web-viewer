"use client";

import React, { useEffect, useState, useRef } from "react";
import { useViewerStore } from "@/features/dicom-viewer/store/useViewerStore";
import { Loader2, Check } from "lucide-react";

export default function ReportModal() {
  const { 
    isReportModalOpen, 
    setIsReportModalOpen, 
    loadedSeries, 
    activeViewportId,
    viewportSeriesMap,
    aiResults,
    memoText
  } = useViewerStore();

  const [physicianName, setPhysicianName] = useState("");
  const [isLlmLoading, setIsLlmLoading] = useState(false);
  const [llmSummary, setLlmSummary] = useState("");
  const [isReviewed, setIsReviewed] = useState(false);

  // Active Series 데이터 가져오기
  const currentSeriesUID = viewportSeriesMap[activeViewportId];
  const activeSeries = loadedSeries.find(s => s.seriesUID === currentSeriesUID);
  
  // 환자/검사 메타데이터
  const metadata = {
    patientName: activeSeries?.patient.name || "Unknown",
    patientId: activeSeries?.patient.id || "Unknown",
    patientSex: activeSeries?.patient.sex || "Unknown",
    patientDOB: activeSeries?.patient.birthDate || "Unknown",
    studyDate: activeSeries?.study.date || "Unknown",
    accessionNumber: activeSeries?.study.accessionNumber || "Unknown",
    referringPhysician: activeSeries?.study.referringPhysicianName || "",
  };

  useEffect(() => {
    if (isReportModalOpen) {
      // 진찰의 초기화 (메타데이터에 있으면 채우기)
      setPhysicianName(metadata.referringPhysician);
      setIsReviewed(false);
      setLlmSummary("");
      
      // 모의 LLM 호출 시작
      setIsLlmLoading(true);
      
      // 1.5초 후 생성 완료를 모방하는 setTimeout
      const timer = setTimeout(() => {
        const generatedText = 
`[의학 AI 추론 결과 요약]
- 총 ${aiResults.length}건의 이상 소견이 발견되었습니다.

[담당의 소견 메모]
${memoText || "작성된 소견 메모가 없습니다."}

[종합 소견]
본 환자의 영상 자료와 담당의의 소견을 종합한 결과입니다. (LLM 요약 텍스트 예시)`;

        // 타이핑 효과를 위해 한 글자씩 추가
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
          setLlmSummary(generatedText.slice(0, currentIndex + 1));
          currentIndex++;
          
          if (currentIndex === generatedText.length) {
            clearInterval(typingInterval);
            setIsLlmLoading(false);
          }
        }, 10); // 한 글자당 10ms
        
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isReportModalOpen, metadata.referringPhysician, aiResults.length, memoText]);

  if (!isReportModalOpen) return null;

  const handleErmSubmit = () => {
    alert("ERM에 담당의의 소견서를 첨가했습니다.");
  };

  const handleResearchDbSubmit = () => {
    const studyId = activeSeries?.study.id || "Unknown";
    alert(`연구 DB에 소견을 제출했습니다. (Study ID: ${studyId})`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white text-neutral-900 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 border-b border-neutral-200 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">영상의학 판독 및 임상 소견</h2>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600">진찰의:</span>
              <input 
                type="text" 
                value={physicianName}
                onChange={(e) => setPhysicianName(e.target.value)}
                placeholder="직접 입력 가능"
                className="border-b border-neutral-400 bg-transparent px-2 py-1 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-neutral-700 bg-neutral-50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="font-medium text-neutral-500">Patient's Name:</span>
              <span>{metadata.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-neutral-500">Patient's DOB:</span>
              <span>{metadata.patientDOB}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-neutral-500">Patient's ID:</span>
              <span>{metadata.patientId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-neutral-500">Study Date:</span>
              <span>{metadata.studyDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-neutral-500">Patient's Sex:</span>
              <span>{metadata.patientSex}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-neutral-500">Accession Number:</span>
              <span>{metadata.accessionNumber}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/50">
          
          {/* AI Inference Section */}
          <div>
            <h3 className="text-sm font-bold text-neutral-500 mb-3 uppercase tracking-wider">
              AI 분석결과 (의학 AI에 의해 자동으로 채워짐)
            </h3>
            <div className="flex flex-col gap-3">
              {aiResults.length === 0 ? (
                <div className="text-center p-8 bg-white border border-neutral-200 rounded-lg text-neutral-400">
                  AI 분석 결과가 없습니다.
                </div>
              ) : (
                aiResults.map((result, idx) => (
                  <div key={result.id} className="flex bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Mock Image Placeholder */}
                    <div className="w-48 h-48 bg-red-100 flex flex-col items-center justify-center shrink-0 border-r border-neutral-200 relative overflow-hidden">
                      <div className="text-xl font-bold text-red-900 mb-2">추론 png</div>
                      <div className="text-sm text-red-800">(대표 슬라이스 {result.sliceIndex + 1})</div>
                      {/* Note: 메인 캔버스 연동 기능은 요구사항에 따라 제거되었습니다. */}
                    </div>
                    {/* Mock AI Text Output */}
                    <div className="p-4 flex-1 flex flex-col justify-center">
                      <div className="text-lg font-bold text-neutral-800 mb-2">추론 내용</div>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        병변 위치 좌표: (X: {result.lesion.x.toFixed(0)}, Y: {result.lesion.y.toFixed(0)})<br />
                        병변 크기: {result.lesion.width.toFixed(0)} x {result.lesion.height.toFixed(0)}<br />
                        AI 모델 분석 결과 이 영역에 이상 징후가 감지되었습니다.
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LLM Summary Section */}
          <div>
            <h3 className="text-sm font-bold text-neutral-500 mb-3 uppercase tracking-wider">
              소견 메모와 AI 분석결과를 종합해 요약한 소견서
            </h3>
            <div className="relative">
              <textarea 
                value={llmSummary}
                onChange={(e) => setLlmSummary(e.target.value)}
                disabled={isLlmLoading}
                className={`w-full h-48 p-4 border border-neutral-200 rounded-lg bg-neutral-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all ${
                  isLlmLoading ? 'text-neutral-400' : 'text-neutral-800'
                }`}
                placeholder="LLM이 소견서를 생성중입니다..."
              />
              
              {/* Loading Overlay inside Textarea */}
              {isLlmLoading && (
                <div className="absolute top-4 right-4 flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-semibold">LLM 분석 중...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-2 ml-1">
              * 검토 후 내용을 직접 수정할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-6 border-t border-neutral-200 bg-white shrink-0">
          <div className="flex items-center justify-center mb-6">
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={isReviewed}
                  onChange={(e) => setIsReviewed(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-6 h-6 border-2 border-neutral-300 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors group-hover:border-blue-500"></div>
                <Check className={`absolute w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity`} />
              </div>
              <span className="text-neutral-700 font-medium group-hover:text-neutral-900 transition-colors">
                소견서를 최종적으로 검토하였습니다.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="px-6 py-2.5 bg-neutral-200 text-neutral-700 hover:bg-neutral-300 rounded-lg font-medium transition-colors min-w-[120px]"
            >
              취소
            </button>
            
            {/* Checked 시 나타나는 액션 버튼들 */}
            {isReviewed && (
              <>
                <button 
                  onClick={handleResearchDbSubmit}
                  className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors shadow-sm min-w-[160px]"
                >
                  연구 DB에 소견 제출
                </button>
                <button 
                  onClick={handleErmSubmit}
                  className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm min-w-[120px]"
                >
                  ERM에 제출
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
