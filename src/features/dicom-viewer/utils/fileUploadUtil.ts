import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import { SeriesData } from './dicomParserUtil';

export const getFilesFromDataTransfer = async (dataTransfer: DataTransfer): Promise<File[]> => {
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

export const processAndMergeSeries = (
  loadedSeries: SeriesData[],
  seriesList: SeriesData[]
): SeriesData[] => {
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
  
  return Array.from(newMap.values());
};

export const generateMockAiResults = (totalSlices: number) => {
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
