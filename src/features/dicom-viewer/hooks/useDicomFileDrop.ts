import { useState, DragEvent } from 'react';
import { useViewerStore } from '../store/useViewerStore';
import { parseDicomFiles } from '../utils/dicomParserUtil';
import initCornerstone from '../utils/cornerstoneInit';
import { getFilesFromDataTransfer, processAndMergeSeries, generateMockAiResults } from '../utils/fileUploadUtil';

export const useDicomFileDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const { 
    loadedSeries, 
    setLoadedSeries,
    activeViewportId,
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

  const handleFiles = async (files: File[]) => {
    setIsParsing(true);
    try {
      if (files.length > 0) {
        const seriesList = await parseDicomFiles(files);
        
        initCornerstone().then(() => {
          const newLoadedSeries = processAndMergeSeries(loadedSeries, seriesList);
          setLoadedSeries(newLoadedSeries);
          
          if (seriesList.length > 0) {
            const firstSeries = seriesList[0];
            setViewportSeriesMap(activeViewportId, firstSeries.seriesUID);
            setCurrentSeriesName(firstSeries.series.seriesDescription);
            setTotalSlices(firstSeries.imageIds.length);
            
            // Generate Random AI Results for the first series
            setAiResults(generateMockAiResults(firstSeries.imageIds.length));
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

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    try {
      const files = await getFilesFromDataTransfer(e.dataTransfer);
      await handleFiles(files);
    } catch (err) {
      console.error(err);
      setIsParsing(false);
    }
  };

  return { isDragging, isParsing, onDragOver, onDragLeave, onDrop, handleFiles };
};
