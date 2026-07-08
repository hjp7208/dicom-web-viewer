import React, { useRef } from 'react';
import { useViewerStore } from '../store/useViewerStore';
import { SeriesData } from '../utils/dicomParserUtil';
import { useCornerstoneViewport } from '../hooks/useCornerstoneViewport';

export const DicomViewport = ({
  series,
  viewportId,
  onSliceChange,
  isActive,
  onClick
}: {
  series: SeriesData | null,
  viewportId: string,
  onSliceChange?: (index: number) => void,
  isActive: boolean,
  onClick: () => void
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const pixelInfoRef = useRef<HTMLSpanElement>(null);
  const { isAnonymized } = useViewerStore();

  const { sliceIndex, zoom, voi, handleSliderChange, handleWheel, aiOverlayBox } = useCornerstoneViewport({
    viewerRef,
    viewportId,
    series,
    isActive,
    onSliceChange,
    pixelInfoRef
  });

  
  const fileIndex = Math.min(sliceIndex, (series?.files.length || 1) - 1);
  const currentInstance = series?.files[fileIndex]?.instance;

  const modality = series?.series.modality || 'UNKNOWN';
  const columns = currentInstance?.columns || 0;
  const rows = currentInstance?.rows || 0;

  const getOrientationString = (iop: number[]) => {
    if (!iop || iop.length !== 6) return 'Unknown';
    const [rX, rY, rZ, cX, cY, cZ] = iop;
    const nX = Math.abs(rY * cZ - rZ * cY);
    const nY = Math.abs(rZ * cX - rX * cZ);
    const nZ = Math.abs(rX * cY - rY * cX);
    
    if (nZ >= nX && nZ >= nY) return 'Axial';
    if (nY >= nX && nY >= nZ) return 'Coronal';
    if (nX >= nY && nX >= nZ) return 'Sagittal';
    return 'Oblique';
  };
  
  const orientationString = getOrientationString(currentInstance?.imageOrientation || []);
  const maskStr = (str: string | number) => isAnonymized ? '***' : String(str || '');

  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full bg-black ${isActive ? 'border-2 border-blue-500' : 'border border-neutral-700'}`}
    >
      <div
        ref={viewerRef}
        className="w-full h-full absolute inset-0"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Overlays */}
      {series && currentInstance && (
        <div className="absolute inset-0 pointer-events-none p-4 text-[#ffcc00] text-sm font-mono flex flex-col justify-between pr-8 z-10">
          <div className="flex justify-between">
            <div className="flex flex-col drop-shadow-md text-left">
              <span>{maskStr(series.patient.name)}</span>
              <span>{maskStr(series.patient.id)}</span>
              <span>{maskStr(series.patient.birthDate)}</span>
              <span>{maskStr(series.patient.sex)} {maskStr(series.patient.age)}</span>
            </div>
            <div className="flex flex-col text-right drop-shadow-md">
              <span>{maskStr(series.study.institutionName)}</span>
              <span>{maskStr(series.study.description)}</span>
              <span>{maskStr(series.study.date)} {maskStr(series.study.time)}</span>
              <span>Study ID: {maskStr(series.study.id)}</span>
              <span>Acc: {maskStr(series.study.accessionNumber)}</span>
            </div>
          </div>

          <div className="flex justify-between mt-auto">
            <div className="flex flex-col drop-shadow-md text-left">
              <span>Frame: {sliceIndex + 1} / {series.imageIds.length}</span>
              <span>Zoom: {zoom.toFixed(2)}x</span>
              <span>WW/WC: {voi.ww} / {voi.wc}</span>
              <span>{modality} ({columns} x {rows}) - {orientationString}</span>
              <span ref={pixelInfoRef}>X: -- Y: -- | {modality === 'CT' ? 'HU' : 'Pixel'}: --</span>
            </div>
            <div className="flex flex-col text-right drop-shadow-md">
              <span>{maskStr(series.series.seriesDescription)}</span>
              <span>Thick: {series.series.modalitySpecific?.sliceThickness || 'N/A'} mm</span>
              <span>Loc: {currentInstance.sliceLocation || 'N/A'} mm</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Overlay Box */}
      {series && aiOverlayBox && (
        <div
          className="absolute border-2 border-red-500 bg-red-500/10 pointer-events-none z-20"
          style={{ 
            left: `${aiOverlayBox.left}px`, 
            top: `${aiOverlayBox.top}px`, 
            width: `${aiOverlayBox.width}px`, 
            height: `${aiOverlayBox.height}px` 
          }}
        />
      )}

      {/* Per-Viewport Scrollbar */}
      {series && series.imageIds.length > 1 && (
        <div
          className="absolute top-0 bottom-0 right-0 w-6 bg-transparent hover:bg-black/60 transition-colors duration-300 ease-in-out flex flex-col items-center py-4 z-30 group"
          onWheel={handleWheel}
        >
          <input
            type="range"
            min="0"
            max={series.imageIds.length - 1}
            value={series.imageIds.length - 1 - sliceIndex}
            onChange={handleSliderChange}
            className="flex-1 w-full cursor-pointer accent-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
            style={{
              writingMode: 'vertical-lr',
              direction: 'rtl',
            }}
            // @ts-expect-error - orient is a non-standard attribute used for Firefox
            orient="vertical"
            title="Slice Indicator"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
