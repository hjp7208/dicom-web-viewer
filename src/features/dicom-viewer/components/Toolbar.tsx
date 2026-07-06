"use client";

import React, { useState } from 'react';
import { 
  Move, ZoomIn, Sun, Ruler, Square, 
  RotateCcw, LayoutGrid, EyeOff, Eye,
  Activity
} from 'lucide-react';
import { useViewerStore } from '@/features/dicom-viewer/store/useViewerStore';

export default function Toolbar() {
  const { 
    activeTool, setActiveTool, 
    isAnonymized, toggleAnonymization,
    viewportLayout, setViewportLayout
  } = useViewerStore();

  const [presetOpen, setPresetOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);

  const tools = [
    { id: 'Pan', icon: <Move className="w-5 h-5" />, label: '이동' },
    { id: 'Zoom', icon: <ZoomIn className="w-5 h-5" />, label: '확대/축소' },
    { id: 'WindowLevel', icon: <Sun className="w-5 h-5" />, label: '밝기/대조' },
    { id: 'Length', icon: <Ruler className="w-5 h-5" />, label: '길이' },
    { id: 'Angle', icon: <Activity className="w-5 h-5" />, label: '각도' },
    { id: 'RectangleROI', icon: <Square className="w-5 h-5" />, label: '면적/ROI' },
  ];

  const handleReset = () => {
    // We'll dispatch a custom event to trigger reset in the viewer
    window.dispatchEvent(new CustomEvent('dicom-viewer-reset'));
  };

  const handlePresetChange = (preset: string) => {
    window.dispatchEvent(new CustomEvent('dicom-preset-change', { detail: { preset } }));
    setPresetOpen(false);
  };

  return (
    <div className="flex items-center gap-1 p-1.5 bg-neutral-900/70 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl relative z-20">
      
      {/* Core Tools */}
      <div className="flex items-center gap-0.5">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              activeTool === tool.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-white/10 mx-2" />

      {/* Preset Dropdown */}
      <div className="relative flex items-center">
        <button 
          onClick={() => setPresetOpen(!presetOpen)}
          className="h-9 px-4 rounded-full flex items-center justify-center text-xs font-semibold tracking-wider transition-colors text-neutral-300 hover:text-white hover:bg-white/10"
        >
          W/L PRESET
        </button>
        {presetOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-36 bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
            {['Lung', 'Abdomen', 'Brain', 'Bone'].map(preset => (
              <button
                key={preset}
                onClick={() => handlePresetChange(preset)}
                className="block w-full text-center px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-white/10 mx-2" />

      {/* Utilities */}
      <div className="flex items-center gap-0.5">
        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          title="초기화 (Reset)"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Layout Split Dropdown */}
        <div className="relative flex items-center">
          <button
            onClick={() => setLayoutOpen(!layoutOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            title="분할 (Layout)"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          {layoutOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-20 bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 flex flex-col">
                <button
                  onClick={() => { setViewportLayout('1x1'); setLayoutOpen(false); }}
                  className={`px-4 py-2 text-sm text-center font-medium transition-colors ${viewportLayout === '1x1' ? 'bg-blue-600/20 text-blue-400' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}
                >
                  1x1
                </button>
                <button
                  onClick={() => { setViewportLayout('1x2'); setLayoutOpen(false); }}
                  className={`px-4 py-2 text-sm text-center font-medium transition-colors ${viewportLayout === '1x2' ? 'bg-blue-600/20 text-blue-400' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}
                >
                  1x2
                </button>
                <button
                  onClick={() => { setViewportLayout('2x2'); setLayoutOpen(false); }}
                  className={`px-4 py-2 text-sm text-center font-medium transition-colors ${viewportLayout === '2x2' ? 'bg-blue-600/20 text-blue-400' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}
                >
                  2x2
                </button>
            </div>
          )}
        </div>

        {/* Anonymization Toggle */}
        <button
          onClick={toggleAnonymization}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            isAnonymized ? 'bg-amber-500/20 text-amber-500' : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
          title="환자 정보 마스킹 (Anonymize)"
        >
          {isAnonymized ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

    </div>
  );
}
