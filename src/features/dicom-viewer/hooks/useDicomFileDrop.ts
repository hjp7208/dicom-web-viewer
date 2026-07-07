import { useState, DragEvent } from 'react';
import { useViewerStore } from '../store/useViewerStore';
import { parseDicomFiles } from '../utils/dicomParserUtil';
import initCornerstone from '../../../lib/cornerstoneInit';
import { getFilesFromDataTransfer, processAndMergeSeries, generateMockAiResults, processZipFiles } from '../utils/fileUploadUtil';

export const useDicomFileDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isUnzipping, setIsUnzipping] = useState(false);
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
    setIsUnzipping(true);
    setUploadProgress(0);

    // ZIP 분석(메타데이터 파싱) 과정이 길어질 경우, 사용자가 멈춘 것으로 오해하지 않도록
    // 0%에서 15%까지 천천히 차오르는 가짜 진행률(Optimistic Progress)을 시작합니다.
    let fakeProgress = 0;
    const fakeProgressInterval = setInterval(() => {
      fakeProgress += 1;
      if (fakeProgress <= 15) {
        setUploadProgress(fakeProgress);
      }
    }, 200);

    // UI 렌더링을 위해 이벤트 루프를 한 번 양보(Yield)합니다.
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      if (files.length > 0) {
        const processedFiles = await processZipFiles(files, (extracted, total) => {
          clearInterval(fakeProgressInterval); // 실제 추출이 시작되면 가짜 타이머 종료
          // 실제 추출 비율을 15% ~ 100% 구간으로 스케일링하여 부드럽게 이어지게 합니다.
          const actualProgress = 15 + Math.round((extracted / total) * 85);
          setUploadProgress(actualProgress);
        });
        clearInterval(fakeProgressInterval);
        setIsUnzipping(false);
        if (processedFiles.length === 0) {
          return;
        }

        setIsParsing(true);
        const seriesList = await parseDicomFiles(processedFiles, (parsed, total) => {
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
        clearInterval(fakeProgressInterval);
        setIsUnzipping(false);
        setIsParsing(false);
        setUploadProgress(0);
      }
    } catch (err) {
      clearInterval(fakeProgressInterval);
      console.error(err);
      setIsUnzipping(false);
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

  return { isDragging, isParsing, isUnzipping, uploadProgress, onDragOver, onDragLeave, onDrop, handleFiles };
};
