import { useEffect, useState } from 'react';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import { useViewerStore } from '../store/useViewerStore';
import { SeriesData } from '../utils/dicomParserUtil';
import initCornerstone from '../utils/cornerstoneInit';
import { DICOM_TOOL_GROUP_ID, setupToolGroup } from '../utils/cornerstoneToolsUtil';

const renderingEngineId = 'dicom_viewer_engine';

interface UseCornerstoneViewportProps {
  viewerRef: React.RefObject<HTMLDivElement>;
  viewportId: string;
  series: SeriesData | null;
  isActive: boolean;
  onSliceChange?: (index: number) => void;
  aiOverlayRef?: React.RefObject<HTMLDivElement>;
  pixelInfoRef?: React.RefObject<HTMLSpanElement>;
}

export const useCornerstoneViewport = ({
  viewerRef,
  viewportId,
  series,
  isActive,
  onSliceChange,
  aiOverlayRef,
  pixelInfoRef
}: UseCornerstoneViewportProps) => {
  const [isReady, setIsReady] = useState(false);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [voi, setVoi] = useState<{ ww: number | string, wc: number | string }>({ ww: 'Auto', wc: 'Auto' });
  const { activeTool, setCurrentSliceIndex, showAiOverlay } = useViewerStore();

  const updateOverlay = () => {
    if (!aiOverlayRef?.current) return;
    const v = cornerstone.getRenderingEngine(renderingEngineId)?.getViewport(viewportId) as cornerstone.Types.IStackViewport;
    if (!v) return;

    const state = useViewerStore.getState();
    // Use the actual image index from the viewport if available, else sliceIndex state
    const currentIdx = v.getCurrentImageIdIndex();
    if (currentIdx === undefined) return;

    const aiResult = state.aiResults.find(r => r.sliceIndex === currentIdx);

    if (state.showAiOverlay && aiResult) {
      const imgData = v.getImageData();
      if (imgData) {
        const imgWidth = imgData.dimensions[0];
        const imgHeight = imgData.dimensions[1];

        const { x, y, width, height } = aiResult.lesion;

        const imageId = v.getCurrentImageId();
        if (!imageId) return;

        const topLeftWorld = cornerstone.utilities.imageToWorldCoords(imageId, [x * imgWidth, y * imgHeight]);
        const bottomRightWorld = cornerstone.utilities.imageToWorldCoords(imageId, [(x + width) * imgWidth, (y + height) * imgHeight]);

        if (!topLeftWorld || !bottomRightWorld) return;

        const topLeftCanvas = v.worldToCanvas(topLeftWorld);
        const bottomRightCanvas = v.worldToCanvas(bottomRightWorld);

        aiOverlayRef.current.style.left = `${topLeftCanvas[0]}px`;
        aiOverlayRef.current.style.top = `${topLeftCanvas[1]}px`;
        aiOverlayRef.current.style.width = `${bottomRightCanvas[0] - topLeftCanvas[0]}px`;
        aiOverlayRef.current.style.height = `${bottomRightCanvas[1] - topLeftCanvas[1]}px`;
        aiOverlayRef.current.style.display = 'block';
      }
    } else {
      aiOverlayRef.current.style.display = 'none';
    }
  };

  useEffect(() => {
    updateOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAiOverlay, sliceIndex]);

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
        const toolGroup = setupToolGroup();
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

        const updateViewportInfo = () => {
          const v = cornerstone.getRenderingEngine(renderingEngineId)?.getViewport(viewportId) as cornerstone.Types.IStackViewport;
          if (v) {
            if (typeof v.getZoom === 'function') {
              setZoom(v.getZoom());
            }
            if (typeof v.getProperties === 'function') {
              const props = v.getProperties();
              if (props.voiRange) {
                const { lower, upper } = props.voiRange;
                const ww = upper - lower;
                const wc = lower + ww / 2;
                setVoi({ ww: Math.round(ww), wc: Math.round(wc) });
              }
            }
          }
          updateOverlay();
        };

        updateViewportInfo();

        const handleNewImage = (e: CustomEvent) => {
          const newIdx = e.detail.imageIdIndex;
          setSliceIndex(newIdx);
          const state = useViewerStore.getState();
          if (state.activeViewportId === viewportId) {
            state.setCurrentSliceIndex(newIdx);
            if (onSliceChange) onSliceChange(newIdx);
          }
          setTimeout(() => {
            const engine = cornerstone.getRenderingEngine(renderingEngineId);
            const vp = engine?.getViewport(viewportId) as cornerstone.Types.IStackViewport;
            if (vp) {
              const currentImageId = vp.getCurrentImageId();
              const image = cornerstone.cache.getImage(currentImageId);
              if (image) {
                const pixels = image.getPixelData();
                const prevPixels = (window as any)._prevPixels;
                if (prevPixels && prevPixels.length === pixels.length) {
                  let isIdentical = true;
                  // Check a sample of pixels to avoid massive loop freeze, but enough to be sure
                  for (let i = 0; i < pixels.length; i += 100) {
                    if (prevPixels[i] !== pixels[i]) {
                      isIdentical = false;
                      break;
                    }
                  }
                  console.log(`[Diagnostic] STACK_NEW_IMAGE Frame: ${newIdx}. Is exactly identical to previous frame? ${isIdentical}`);
                }
                (window as any)._prevPixels = pixels;
              }
            }
          }, 100);
        };

        const handleCameraModified = () => updateViewportInfo();
        const handleVoiModified = () => updateViewportInfo();

        const handleMouseMove = (e: MouseEvent) => {
          if (!pixelInfoRef?.current || !viewerRef.current) return;
          const rect = viewerRef.current.getBoundingClientRect();
          const canvasPos = [e.clientX - rect.left, e.clientY - rect.top] as cornerstone.Types.Point2;
          const v = cornerstone.getRenderingEngine(renderingEngineId)?.getViewport(viewportId) as cornerstone.Types.IStackViewport;

          if (v && v.canvasToWorld && v.getCornerstoneImage) {
            const worldPos = v.canvasToWorld(canvasPos);
            const imageId = v.getCurrentImageId();
            if (imageId) {
              const ij = cornerstone.utilities.worldToImageCoords(imageId, worldPos);
              if (ij) {
                const i = Math.round(ij[0]);
                const j = Math.round(ij[1]);
                const image = v.getCornerstoneImage();
                if (image && image.getPixelData) {
                  if (i >= 0 && i < image.columns && j >= 0 && j < image.rows) {
                    const pixelData = image.getPixelData();
                    let displayValue = '';
                    if (image.color) {
                      const idx = (j * image.columns + i) * 4;
                      displayValue = `R:${pixelData[idx]} G:${pixelData[idx + 1]} B:${pixelData[idx + 2]}`;
                    } else {
                      const pixelValue = pixelData[j * image.columns + i];
                      const modality = series?.series.modality;
                      if (modality === 'CT') {
                        displayValue = `HU: ${pixelValue}`;
                      } else {
                        displayValue = `Pixel: ${pixelValue}`;
                      }
                    }
                    pixelInfoRef.current.innerText = `X: ${i} Y: ${j} | ${displayValue}`;
                    return;
                  }
                }
              }
            }
          }
          const defaultLabel = series?.series.modality === 'CT' ? 'HU' : 'Pixel';
          pixelInfoRef.current.innerText = `X: -- Y: -- | ${defaultLabel}: --`;
        };

        const handleMouseLeave = () => {
          if (pixelInfoRef?.current) {
            const defaultLabel = series?.series.modality === 'CT' ? 'HU' : 'Pixel';
            pixelInfoRef.current.innerText = `X: -- Y: -- | ${defaultLabel}: --`;
          }
        };

        viewerRef.current?.addEventListener(cornerstone.Enums.Events.STACK_NEW_IMAGE, handleNewImage as EventListener);
        viewerRef.current?.addEventListener(cornerstone.Enums.Events.CAMERA_MODIFIED, handleCameraModified);
        viewerRef.current?.addEventListener(cornerstone.Enums.Events.VOI_MODIFIED, handleVoiModified);
        viewerRef.current?.addEventListener('mousemove', handleMouseMove);
        viewerRef.current?.addEventListener('mouseleave', handleMouseLeave);

        return () => {
          viewerRef.current?.removeEventListener(cornerstone.Enums.Events.STACK_NEW_IMAGE, handleNewImage as EventListener);
          viewerRef.current?.removeEventListener(cornerstone.Enums.Events.CAMERA_MODIFIED, handleCameraModified);
          viewerRef.current?.removeEventListener(cornerstone.Enums.Events.VOI_MODIFIED, handleVoiModified);
          viewerRef.current?.removeEventListener('mousemove', handleMouseMove);
          viewerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, series, viewportId]);

  // Update tool group when activeTool changes
  useEffect(() => {
    if (!isReady || !activeTool) return;
    const toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(DICOM_TOOL_GROUP_ID);
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
        viewport.render();
        setTimeout(() => {
          const currentImageId = viewport.getCurrentImageId();
          const image = cornerstone.cache.getImage(currentImageId);
          if (image) {
            const pixels = image.getPixelData();
            console.log(`[Diagnostic] Frame: ${newIdx}, First 5 pixels:`, pixels?.slice(0, 5));
          }
        }, 100);
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

        viewport.setProperties({ voiRange: { lower: wc - ww / 2, upper: wc + ww / 2 } });
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
      viewport.render();
      setTimeout(() => {
        const currentImageId = viewport.getCurrentImageId();
        const image = cornerstone.cache.getImage(currentImageId);
        if (image) {
          const pixels = image.getPixelData();
          console.log(`[Diagnostic] Slider Frame: ${newIndex}, First 5 pixels:`, pixels?.slice(0, 5));
        }
      }, 100);
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
      viewport.render();
      setTimeout(() => {
        const currentImageId = viewport.getCurrentImageId();
        const image = cornerstone.cache.getImage(currentImageId);
        if (image) {
          const pixels = image.getPixelData();
          console.log(`[Diagnostic] Wheel Frame: ${newIdx}, First 5 pixels:`, pixels?.slice(0, 5));
        }
      }, 100);
    }
  };

  return { isReady, sliceIndex, zoom, voi, handleSliderChange, handleWheel };
};
