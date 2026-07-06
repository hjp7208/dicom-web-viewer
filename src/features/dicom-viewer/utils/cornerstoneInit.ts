import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import { addAllTools } from './cornerstoneToolsUtil';

let initialized = false;

export default async function initCornerstone() {
  if (initialized) {
    return;
  }

  // Cornerstone Core Initialization
  await cornerstone.init();
  
  // Cornerstone Tools Initialization
  await cornerstoneTools.init();

  // Initialize the image loader with its default configuration
  cornerstoneDICOMImageLoader.init({
    maxWebWorkers: navigator.hardwareConcurrency ? Math.min(navigator.hardwareConcurrency, 7) : 1,
  });

  // Add custom metadata provider to fix multiframe local files (dicomfile scheme)
  // cornerstoneDICOMImageLoader registers metadata under the base URI (without ?frame=)
  // but queries it using the full URI. This provider strips the query string.
  cornerstone.metaData.addProvider((type: string, imageId: unknown) => {
    if (typeof imageId === 'string' && imageId.startsWith('dicomfile:')) {
      const qIndex = imageId.indexOf('?');
      if (qIndex !== -1) {
        const baseImageId = imageId.substring(0, qIndex);
        return cornerstone.metaData.get(type, baseImageId);
      }
    }
    return undefined;
  }, 10000); // high priority
  
  // Add tools to cornerstoneTools
  addAllTools();

  initialized = true;
}
