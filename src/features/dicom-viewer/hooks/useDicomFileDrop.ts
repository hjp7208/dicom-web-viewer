import { useState, DragEvent } from 'react';
import { useViewerStore } from '../store/useViewerStore';
import { parseDicomFiles } from '../utils/dicomParserUtil';
import initCornerstone from '../utils/cornerstoneInit';
import { getFilesFromDataTransfer, processAndMergeSeries, generateMockAiResults } from '../utils/fileUploadUtil';

export const useDicomFileDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    setUploadProgress(0);
    try {
      if (files.length > 0) {
        const seriesList = await parseDicomFiles(files, (parsed, total) => {
          setUploadProgress(Math.round((parsed / total) * 100));
        });
        
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
          setUploadProgress(0);
        });
      } else {
        setIsParsing(false);
        setUploadProgress(0);
      }
    } catch (err) {
      console.error(err);
      setIsParsing(false);
      setUploadProgress(0);
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
      setUploadProgress(0);
    }
  };

  return { isDragging, isParsing, uploadProgress, onDragOver, onDragLeave, onDrop, handleFiles };
};
