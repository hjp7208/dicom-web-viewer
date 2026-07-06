import { useEffect, useState } from 'react';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import { useViewerStore } from '../store/useViewerStore';
import { SeriesData } from '../utils/dicomParserUtil';
import initCornerstone from '../utils/cornerstoneInit';

const renderingEngineId = 'dicom_viewer_engine';
const toolGroupId = 'dicom_tool_group';

interface UseCornerstoneViewportProps {
  viewerRef: React.RefObject<HTMLDivElement>;
  viewportId: string;
  series: SeriesData | null;
  isActive: boolean;
  onSliceChange?: (index: number) => void;
}

export const useCornerstoneViewport = ({
  viewerRef,
  viewportId,
  series,
  isActive,
  onSliceChange
}: UseCornerstoneViewportProps) => {
  const [isReady, setIsReady] = useState(false);
  const [sliceIndex, setSliceIndex] = useState(0);
  const { activeTool, setCurrentSliceIndex } = useViewerStore();

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
  }, [isReady, series, viewportId, activeTool, isActive, onSliceChange, setCurrentSliceIndex]);

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
      toolGroup.setToolActive(cornerstoneTools.StackScrollTool.toolName, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Wheel }],
      });
    }
  }, [activeTool, isReady]);

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

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!series) return;
    const delta = e.deltaY > 0 ? 1 : -1;
    const newIdx = Math.max(0, Math.min(series.imageIds.length - 1, sliceIndex + delta));
    const renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);
    const viewport = renderingEngine?.getViewport(viewportId) as cornerstone.Types.IStackViewport;
    if (viewport) {
      viewport.setImageIdIndex(newIdx);
    }
  };

  return { isReady, sliceIndex, handleSliderChange, handleWheel };
};
