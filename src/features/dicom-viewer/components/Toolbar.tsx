"use client";

import React, { useState } from 'react';
import {
  Move, ZoomIn, Sun, Ruler, Square,
  RotateCcw, LayoutGrid, EyeOff, Eye,
  Activity
} from 'lucide-react';
import { useViewerStore } from '@/features/dicom-viewer/store/useViewerStore';
import { useThemeStore } from '@/features/theme/useThemeStore';

export default function Toolbar() {
  const {
    activeTool, setActiveTool,
    isAnonymized, toggleAnonymization,
    viewportLayout, setViewportLayout,
    triggerReset, triggerPresetChange
  } = useViewerStore();

  const { isDark } = useThemeStore();

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
    triggerReset();
  };

  const handlePresetChange = (preset: string) => {
    triggerPresetChange(preset);
    setPresetOpen(false);
  };

  const inactiveBtn = isDark
      ? "text-neutral-400 hover:text-white hover:bg-white/10"
      : "text-slate-500 hover:text-slate-900 hover:bg-black/5";

  const dividerColor = isDark ? "bg-white/10" : "bg-black/10";

  return (
      <div className={`flex items-center gap-1 p-1.5 backdrop-blur-xl border rounded-full shadow-2xl relative z-20 ${
          isDark ? "bg-neutral-900/70 border-white/10" : "bg-white/80 border-slate-200"
      }`}>

        {/* Core Tools */}
        <div className="flex items-center gap-0.5">
          {tools.map(tool => (
              <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                      activeTool === tool.id ? 'bg-blue-600 text-white shadow-md' : inactiveBtn
                  }`}
                  title={tool.label}
              >
                {tool.icon}
              </button>
          ))}
        </div>

        <div className={`w-px h-6 mx-2 ${dividerColor}`} />

        {/* Preset Dropdown */}
        <div className="relative flex items-center">
          <button
              onClick={() => setPresetOpen(!presetOpen)}
              className={`h-9 px-4 rounded-full flex items-center justify-center text-xs font-semibold tracking-wider transition-colors ${
                  isDark ? "text-neutral-300 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-black/5"
              }`}
          >
            W/L PRESET
          </button>
          {presetOpen && (
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-36 backdrop-blur-2xl border rounded-xl shadow-2xl overflow-hidden py-1 ${
                  isDark ? "bg-neutral-900/90 border-white/10" : "bg-white/95 border-slate-200"
              }`}>
                {['Lung', 'Abdomen', 'Brain', 'Bone'].map(preset => (
                    <button
                        key={preset}
                        onClick={() => handlePresetChange(preset)}
                        className={`block w-full text-center px-4 py-2.5 text-sm font-medium transition-colors ${
                            isDark ? "text-neutral-300 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-black/5 hover:text-slate-900"
                        }`}
                    >
                      {preset}
                    </button>
                ))}
              </div>
          )}
        </div>

        <div className={`w-px h-6 mx-2 ${dividerColor}`} />

        {/* Utilities */}
        <div className="flex items-center gap-0.5">
          {/* Reset */}
          <button
              onClick={handleReset}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${inactiveBtn}`}
              title="초기화 (Reset)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Layout Split Dropdown */}
          <div className="relative flex items-center">
            <button
                onClick={() => setLayoutOpen(!layoutOpen)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${inactiveBtn}`}
                title="분할 (Layout)"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            {layoutOpen && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-20 backdrop-blur-2xl border rounded-xl shadow-2xl overflow-hidden py-1 flex flex-col ${
                    isDark ? "bg-neutral-900/90 border-white/10" : "bg-white/95 border-slate-200"
                }`}>
                  {(['1x1', '1x2', '2x2'] as const).map((layout) => (
                      <button
                          key={layout}
                          onClick={() => { setViewportLayout(layout); setLayoutOpen(false); }}
                          className={`px-4 py-2 text-sm text-center font-medium transition-colors ${
                              viewportLayout === layout
                                  ? 'bg-blue-600/20 text-blue-500'
                                  : isDark ? "text-neutral-300 hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-black/5 hover:text-slate-900"
                          }`}
                      >
                        {layout}
                      </button>
                  ))}
                </div>
            )}
          </div>

          {/* Anonymization Toggle */}
          <button
              onClick={toggleAnonymization}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isAnonymized ? 'bg-amber-500/20 text-amber-500' : inactiveBtn
              }`}
              title="환자 정보 마스킹 (Anonymize)"
          >
            {isAnonymized ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

      </div>
  );
}