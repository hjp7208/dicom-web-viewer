"use client";

import React, { useState } from 'react';
import { 
  Move, ZoomIn, Sun, Ruler, Square, 
  RotateCcw, LayoutGrid, EyeOff, Eye,
  Activity
} from 'lucide-react';
import { useViewerStore } from '@/lib/useViewerStore';

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
    <div className="flex items-center gap-2 p-2 bg-neutral-900 border-b border-neutral-800 relative z-20">
      <div className="flex bg-neutral-800 rounded-lg p-1">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-2 rounded-md flex items-center justify-center transition-colors ${
              activeTool === tool.id ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-neutral-700 mx-2" />

      {/* Preset Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setPresetOpen(!presetOpen)}
          className="px-3 py-2 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-md text-sm font-medium transition-colors"
        >
          W/L 프리셋
        </button>
        {presetOpen && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-neutral-800 border border-neutral-700 rounded-md shadow-xl overflow-hidden">
            {['Lung', 'Abdomen', 'Brain', 'Bone'].map(preset => (
              <button
                key={preset}
                onClick={() => handlePresetChange(preset)}
                className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white"
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-8 bg-neutral-700 mx-2" />

      {/* Reset */}
      <button
        onClick={handleReset}
        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
        title="초기화(Reset)"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Layout Split */}
      <div className="relative">
        <button
          onClick={() => setLayoutOpen(!layoutOpen)}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
          title="분할 (Layout)"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        {layoutOpen && (
          <div className="absolute top-full right-0 mt-1 w-24 bg-neutral-800 border border-neutral-700 rounded-md shadow-xl overflow-hidden flex flex-col">
             <button
                onClick={() => { setViewportLayout('1x1'); setLayoutOpen(false); }}
                className={`px-4 py-2 text-sm text-left ${viewportLayout === '1x1' ? 'bg-blue-600/20 text-blue-400' : 'text-neutral-300 hover:bg-neutral-700'}`}
              >
                1x1
              </button>
              <button
                onClick={() => { setViewportLayout('1x2'); setLayoutOpen(false); }}
                className={`px-4 py-2 text-sm text-left ${viewportLayout === '1x2' ? 'bg-blue-600/20 text-blue-400' : 'text-neutral-300 hover:bg-neutral-700'}`}
              >
                1x2
              </button>
              <button
                onClick={() => { setViewportLayout('2x2'); setLayoutOpen(false); }}
                className={`px-4 py-2 text-sm text-left ${viewportLayout === '2x2' ? 'bg-blue-600/20 text-blue-400' : 'text-neutral-300 hover:bg-neutral-700'}`}
              >
                2x2
              </button>
          </div>
        )}
      </div>

      {/* Anonymization Toggle */}
      <button
        onClick={toggleAnonymization}
        className={`p-2 rounded-md transition-colors flex items-center gap-2 px-3 ${isAnonymized ? 'bg-amber-600/20 text-amber-500' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        title="환자 정보 보호 (Anonymize)"
      >
        {isAnonymized ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        <span className="text-sm font-medium">{isAnonymized ? 'Masked' : 'Show Info'}</span>
      </button>

    </div>
  );
}
