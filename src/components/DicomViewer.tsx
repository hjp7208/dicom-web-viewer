"use client";

import React, { useEffect, useRef, useState, DragEvent, useMemo } from 'react';
import { Upload } from 'lucide-react';
import initCornerstone from '@/lib/cornerstoneInit';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import { useViewerStore } from '@/lib/useViewerStore';
import { parseDicomFiles, SeriesData } from '@/lib/dicomParserUtil';

const renderingEngineId = 'dicom_viewer_engine';
const toolGroupId = 'dicom_tool_group';

const DicomViewport = ({ 
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
  const [isReady, setIsReady] = useState(false);
  const [sliceIndex, setSliceIndex] = useState(0);
  const { activeTool, isAnonymized, showAiOverlay, setCurrentSliceIndex, aiResults } = useViewerStore();

  useEffect(() => {
    initCornerstone().then(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady || !series || series.imageIds.length === 0 || !viewerRef.current) return;

    let renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);
    
    const loadAndRender = async () => {
      try {
        if (!renderingEngine) {
          renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);
        }

        const viewportInput = {
          viewportId,
          type: cornerstone.Enums.ViewportType.STACK,
          element: viewerRef.current!,
          defaultOptions: {
            background: [0, 0, 0] as cornerstone.Types.Point3,
          },
        };

        renderingEngine.enableElement(viewportInput);
        const viewport = renderingEngine.getViewport(viewportId) as cornerstone.Types.IStackViewport;

        // ToolGroup setup
        let toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(toolGroupId);
        if (!toolGroup) {
          toolGroup = cornerstoneTools.ToolGroupManager.createToolGroup(toolGroupId);
          toolGroup?.addTool(cornerstoneTools.PanTool.toolName);
          toolGroup?.addTool(cornerstoneTools.ZoomTool.toolName);
          toolGroup?.addTool(cornerstoneTools.WindowLevelTool.toolName);
          toolGroup?.addTool(cornerstoneTools.StackScrollTool.toolName);
          toolGroup?.addTool(cornerstoneTools.LengthTool.toolName);
          toolGroup?.addTool(cornerstoneTools.AngleTool.toolName);
          toolGroup?.addTool(cornerstoneTools.RectangleROITool.toolName);
        }
        toolGroup?.addViewport(viewportId, renderingEngineId);

        // Set tool bindings
        if (toolGroup) {
          toolGroup.setToolActive(activeTool, {
            bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Primary }],
          });
          // Bind StackScroll to mouse wheel
          toolGroup.setToolActive(cornerstoneTools.StackScrollTool.toolName, {
            bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Wheel }],
          });
        }

        setSliceIndex(0);
        if (isActive) setCurrentSliceIndex(0);

        await viewport.setStack(series.imageIds, 0);
        viewport.render();

        const handleNewImage = (e: CustomEvent) => {
          const newIdx = e.detail.imageIdIndex;
          setSliceIndex(newIdx);
          const state = useViewerStore.getState();
          if (state.activeViewportId === viewportId) {
            state.setCurrentSliceIndex(newIdx);
            if (onSliceChange) onSliceChange(newIdx);
          }
        };

        viewerRef.current?.addEventListener(cornerstone.Enums.Events.STACK_NEW_IMAGE, handleNewImage as EventListener);

        // Cleanup listener on next render or unmount inside a closure
        return () => {
          viewerRef.current?.removeEventListener(cornerstone.Enums.Events.STACK_NEW_IMAGE, handleNewImage as EventListener);
        };
      } catch (error) {
        console.error('Error rendering DICOM:', error);
      }
    };

    let cleanupListener: (() => void) | undefined;
    loadAndRender().then(cleanup => {
      cleanupListener = cleanup;
    });

    return () => {
      if (cleanupListener) cleanupListener();
      const engine = cornerstone.getRenderingEngine(renderingEngineId);
      if (engine) {
        engine.disableElement(viewportId);
      }
    };
  }, [isReady, series, viewportId]);

  // Update tool group when activeTool changes
  useEffect(() => {
    if (!isReady || !activeTool) return;
    const toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(toolGroupId);
    if (toolGroup) {
      const activePrimary = toolGroup.getActivePrimaryMouseButtonTool();
      if (activePrimary && activePrimary !== activeTool) {
        toolGroup.setToolPassive(activePrimary);
      }

      toolGroup.setToolActive(activeTool, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Primary }],
      });
      // Ensure StackScroll on mouse wheel remains
      toolGroup.setToolActive(cornerstoneTools.StackScrollTool.toolName, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Wheel }],
      });
    }
  }, [activeTool, isReady, viewportId]);

  // Handle custom events
  useEffect(() => {
    if (!isActive) return;

    const handleJumpSlice = (e: Event) => {
      const { sliceIndex: newIdx } = (e as CustomEvent).detail;
      const renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);
      const viewport = renderingEngine?.getViewport(viewportId) as cornerstone.Types.IStackViewport;
      if (viewport) {
         viewport.setImageIdIndex(newIdx);
      }
    };

    const handleReset = () => {
      const renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);
      const viewport = renderingEngine?.getViewport(viewportId) as cornerstone.Types.IStackViewport;
      if (viewport) {
        viewport.resetCamera();
        if (viewport.resetProperties) viewport.resetProperties();
        cornerstoneTools.annotation.state.getAnnotationManager().removeAllAnnotations();
        viewport.render();
      }
    };

    const handlePresetChange = (e: Event) => {
      const { preset } = (e as CustomEvent).detail;
      const renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);
      const viewport = renderingEngine?.getViewport(viewportId) as cornerstone.Types.IStackViewport;
      if (viewport) {
        let ww = 400, wc = 40;
        if (preset === 'Lung') { ww = 1500; wc = -600; }
        else if (preset === 'Bone') { ww = 1500; wc = 300; }
        else if (preset === 'Brain') { ww = 80; wc = 40; }
        else if (preset === 'Abdomen') { ww = 400; wc = 40; }
        
        viewport.setProperties({ voiRange: { lower: wc - ww/2, upper: wc + ww/2 } });
        viewport.render();
      }
    };

    window.addEventListener('dicom-jump-slice', handleJumpSlice);
    window.addEventListener('dicom-viewer-reset', handleReset);
    window.addEventListener('dicom-preset-change', handlePresetChange);

    return () => {
      window.removeEventListener('dicom-jump-slice', handleJumpSlice);
      window.removeEventListener('dicom-viewer-reset', handleReset);
      window.removeEventListener('dicom-preset-change', handlePresetChange);
    };
  }, [isActive, viewportId]);



  // Find AI lesion for current slice
  const aiResult = useMemo(() => aiResults.find(r => r.sliceIndex === sliceIndex), [aiResults, sliceIndex]);

  const maskStr = (str: string | number) => isAnonymized ? '***' : String(str || '');

  // Get current instance metadata based on sliceIndex (for multiframe, they share the same instance info mostly)
  const fileIndex = series ? Math.min(sliceIndex, series.files.length - 1) : 0;
  const currentInstance = series?.files[fileIndex]?.instance;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!series) return;
    const val = parseInt(e.target.value, 10);
    const newIndex = series.imageIds.length - 1 - val;
    
    const renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);
    const viewport = renderingEngine?.getViewport(viewportId) as cornerstone.Types.IStackViewport;
    if (viewport) {
      viewport.setImageIdIndex(newIndex);
    }
  };

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
          <div className="absolute inset-0 pointer-events-none p-4 text-[#ffcc00] text-sm font-mono flex flex-col justify-between pr-8">
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
                <span>Zoom: 1.0</span>
                <span>WW/WC: {currentInstance.windowWidth || 'Auto'} / {currentInstance.windowLevel || 'Auto'}</span>
              </div>
              <div className="flex flex-col text-right drop-shadow-md">
                <span>{maskStr(series.series.seriesDescription)}</span>
                <span>Thick: {series.series.modalitySpecific?.sliceThickness || 'N/A'}</span>
                <span>Loc: {currentInstance.sliceLocation || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Overlay Box */}
        {series && showAiOverlay && aiResult && (
          <div 
            className="absolute border-2 border-red-500 bg-red-500/10 pointer-events-none transition-all z-10"
            style={{
              left: aiResult.lesion.x, top: aiResult.lesion.y, 
              width: aiResult.lesion.width, height: aiResult.lesion.height
            }}
          />
        )}

        {/* Per-Viewport Scrollbar */}
        {series && series.imageIds.length > 1 && (
          <div className="absolute top-0 bottom-0 right-0 w-6 bg-transparent hover:bg-black/60 transition-colors duration-300 ease-in-out flex flex-col items-center py-4 z-20 group">
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

const getFilesFromDataTransfer = async (dataTransfer: DataTransfer): Promise<File[]> => {
  const files: File[] = [];
  if (!dataTransfer.items) {
    return Array.from(dataTransfer.files);
  }

  const items = Array.from(dataTransfer.items);
  const entries = items.map(item => item.webkitGetAsEntry ? item.webkitGetAsEntry() : null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const traverseFileTree = async (item: any) => {
    return new Promise<void>((resolve) => {
      if (!item) {
        resolve();
      } else if (item.isFile) {
        item.file((file: File) => {
          files.push(file);
          resolve();
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        const readEntries = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dirReader.readEntries(async (entries: any[]) => {
            if (entries.length === 0) {
              resolve();
            } else {
              for (const entry of entries) {
                 await traverseFileTree(entry);
              }
              readEntries();
            }
          });
        };
        readEntries();
      } else {
        resolve();
      }
    });
  };

  const promises = entries.map((entry, idx) => {
    if (entry) {
      return traverseFileTree(entry);
    } else {
      const item = items[idx];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
      return Promise.resolve();
    }
  });

  await Promise.all(promises);
  return files;
};

const generateMockAiResults = (totalSlices: number) => {
  const numResults = Math.min(5, totalSlices);
  const slices = new Set<number>();
  while (slices.size < numResults) {
    slices.add(Math.floor(Math.random() * totalSlices));
  }
  return Array.from(slices).sort((a, b) => a - b).map((sliceIndex, i) => ({
    id: i + 1,
    sliceIndex,
    lesion: {
      x: `${20 + Math.random() * 50}%`,
      y: `${20 + Math.random() * 50}%`,
      width: `${5 + Math.random() * 15}%`,
      height: `${5 + Math.random() * 15}%`
    }
  }));
};

export default function DicomViewer() {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const { 
    viewportLayout, 
    loadedSeries, 
    setLoadedSeries,
    activeViewportId,
    setActiveViewportId,
    viewportSeriesMap,
    setViewportSeriesMap,
    setCurrentSeriesName,
    setTotalSlices,
    setAiResults
  } = useViewerStore();

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    setIsParsing(true);
    try {
      const files = await getFilesFromDataTransfer(e.dataTransfer);
      
      if (files.length > 0) {
        const seriesList = await parseDicomFiles(files);
        
        initCornerstone().then(() => {
          seriesList.forEach(series => {
            series.imageIds = [];
            series.files.forEach(meta => {
              const baseId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(meta.file);
              const numFrames = meta.instance.numberOfFrames;
              if (numFrames > 1) {
                for (let i = 0; i < numFrames; i++) {
                  series.imageIds.push(`${baseId}?frame=${i}`);
                }
              } else {
                series.imageIds.push(baseId);
              }
            });
          });
          
          const newMap = new Map<string, SeriesData>();
          loadedSeries.forEach(s => newMap.set(s.seriesUID, s));
          seriesList.forEach(s => {
            if (newMap.has(s.seriesUID)) {
              const existing = newMap.get(s.seriesUID);
              if (existing) {
                existing.files.push(...s.files);
                // Re-sort files by instance number
                existing.files.sort((a, b) => a.instance.instanceNumber - b.instance.instanceNumber);
                
                // Regenerate imageIds in order
                existing.imageIds = [];
                existing.files.forEach((meta) => {
                  const baseId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(meta.file);
                  const numFrames = meta.instance.numberOfFrames;
                  if (numFrames > 1) {
                    for (let i = 0; i < numFrames; i++) {
                      existing.imageIds.push(`${baseId}?frame=${i}`);
                    }
                  } else {
                    existing.imageIds.push(baseId);
                  }
                });
              }
            } else {
              newMap.set(s.seriesUID, s);
            }
          });
          const newLoadedSeries = Array.from(newMap.values());
          setLoadedSeries(newLoadedSeries);
          
          if (seriesList.length > 0) {
            const firstSeries = seriesList[0];
            setViewportSeriesMap(activeViewportId, firstSeries.seriesUID);
            setCurrentSeriesName(firstSeries.series.seriesDescription);
            setTotalSlices(firstSeries.imageIds.length);
            
            // Generate Random AI Results for the first series
            const aiData = generateMockAiResults(firstSeries.imageIds.length);
            setAiResults(aiData);
          }
          setIsParsing(false);
        });
      } else {
        setIsParsing(false);
      }
    } catch (err) {
      console.error(err);
      setIsParsing(false);
    }
  };

  const handleViewportClick = (viewportId: string) => {
    setActiveViewportId(viewportId);
    const seriesUID = viewportSeriesMap[viewportId];
    if (seriesUID) {
      const series = loadedSeries.find(s => s.seriesUID === seriesUID);
      if (series) {
        setCurrentSeriesName(series.series.seriesDescription);
        setTotalSlices(series.imageIds.length);
      }
    }
  };

  const getGridClasses = () => {
    switch(viewportLayout) {
      case '1x2': return 'grid-cols-2 grid-rows-1';
      case '2x2': return 'grid-cols-2 grid-rows-2';
      case '1x1':
      default: return 'grid-cols-1 grid-rows-1';
    }
  };

  const numViewports = viewportLayout === '2x2' ? 4 : (viewportLayout === '1x2' ? 2 : 1);

  return (
    <div className="flex-1 w-full bg-neutral-900 rounded-lg overflow-hidden shadow-2xl relative flex flex-col">
      {loadedSeries.length === 0 ? (
        <div 
          className={`flex-1 flex flex-col items-center justify-center p-12 transition-colors duration-300 ${
            isDragging ? 'bg-neutral-800/80 border-2 border-dashed border-blue-500 m-2' : 'bg-transparent border-2 border-dashed border-neutral-700 m-2'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
            <Upload className={`w-10 h-10 ${isDragging ? 'text-blue-500' : 'text-neutral-400'}`} />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            {isParsing ? 'Parsing DICOM...' : 'Drag & Drop DICOM Files or Folder'}
          </h3>
          <p className="text-neutral-400 text-center mb-8 max-w-md">
             {isParsing ? '파일을 분석 중입니다. 잠시만 기다려주세요.' : '테스트를 위해 여러 .dcm 파일 또는 폴더를 여기에 드롭하세요.'}
          </p>
        </div>
      ) : (
        <div className={`flex-1 grid gap-1 p-1 bg-black ${getGridClasses()}`}>
          {Array.from({ length: numViewports }).map((_, idx) => {
            const vpId = `dicom_viewport_${idx}`;
            const seriesUID = viewportSeriesMap[vpId];
            const series = loadedSeries.find(s => s.seriesUID === seriesUID) || null;
            
            return (
              <DicomViewport 
                key={`viewport-${idx}`} 
                viewportId={vpId} 
                series={series} 
                isActive={activeViewportId === vpId}
                onClick={() => handleViewportClick(vpId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
