import { create } from 'zustand';
import { SeriesData } from '../utils/dicomParserUtil';

export interface AiResult {
  id: number;
  sliceIndex: number;
  lesion: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ViewerState {
  activeTool: string;
  isAnonymized: boolean;
  showAiOverlay: boolean;
  currentSliceIndex: number;
  totalSlices: number;
  currentSeriesName: string;
  viewportLayout: string; // e.g., '1x1', '1x2'
  
  loadedSeries: SeriesData[];
  activeSeriesUID: string | null;
  activeViewportId: string; // ID of the viewport currently receiving actions
  viewportSeriesMap: Record<string, string>; // Maps viewportId -> seriesUID

  aiResults: AiResult[];

  // Actions
  setActiveTool: (tool: string) => void;
  toggleAnonymization: () => void;
  toggleAiOverlay: () => void;
  setCurrentSliceIndex: (index: number) => void;
  setTotalSlices: (total: number) => void;
  setCurrentSeriesName: (name: string) => void;
  setViewportLayout: (layout: string) => void;

  setLoadedSeries: (series: SeriesData[]) => void;
  setActiveSeriesUID: (uid: string | null) => void;
  setActiveViewportId: (id: string) => void;
  setViewportSeriesMap: (viewportId: string, seriesUID: string) => void;

  setAiResults: (results: AiResult[]) => void;
  resetViewer: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  activeTool: 'WindowLevel', // Default tool
  isAnonymized: false,
  showAiOverlay: true,
  currentSliceIndex: 0,
  totalSlices: 0,
  currentSeriesName: '',
  viewportLayout: '1x1',
  
  loadedSeries: [],
  activeSeriesUID: null,
  activeViewportId: 'dicom_viewport_0',
  viewportSeriesMap: {},

  aiResults: [],

  setActiveTool: (tool) => set({ activeTool: tool }),
  toggleAnonymization: () => set((state) => ({ isAnonymized: !state.isAnonymized })),
  toggleAiOverlay: () => set((state) => ({ showAiOverlay: !state.showAiOverlay })),
  setCurrentSliceIndex: (index) => set({ currentSliceIndex: index }),
  setTotalSlices: (total) => set({ totalSlices: total }),
  setCurrentSeriesName: (name) => set({ currentSeriesName: name }),
  setViewportLayout: (layout) => set({ viewportLayout: layout }),

  setLoadedSeries: (series) => set({ loadedSeries: series }),
  setActiveSeriesUID: (uid) => set({ activeSeriesUID: uid }),
  setActiveViewportId: (id) => set({ activeViewportId: id }),
  setViewportSeriesMap: (viewportId, seriesUID) => set((state) => ({
    viewportSeriesMap: { ...state.viewportSeriesMap, [viewportId]: seriesUID }
  })),

  setAiResults: (results) => set({ aiResults: results }),
  resetViewer: () => set({
    loadedSeries: [],
    activeSeriesUID: null,
    viewportSeriesMap: {},
    aiResults: [],
    currentSliceIndex: 0,
    totalSlices: 0,
    currentSeriesName: '',
  }),
}));
