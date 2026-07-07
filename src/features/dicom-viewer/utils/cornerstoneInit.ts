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

  // Override dicomfile image loader
  cornerstone.imageLoader.registerImageLoader('dicomfile', (imageId: string) => {
    return cornerstoneDICOMImageLoader.wadouri.loadImage(imageId);
  });

  if (cornerstoneDICOMImageLoader.wadouri.metaData?.metaDataProvider) {
    cornerstone.metaData.addProvider(cornerstoneDICOMImageLoader.wadouri.metaData.metaDataProvider, 9999);
  }

  // Custom metadata provider for local multiframe and missing metadata patching
  cornerstone.metaData.addProvider((type: string, imageId: unknown) => {
    if (type === 'instance') {
      return undefined;
    }

    if (typeof imageId === 'string' && imageId.startsWith('dicomfile:')) {
      const qIndex = imageId.indexOf('?');
      const baseImageId = qIndex !== -1 ? imageId.substring(0, qIndex) : imageId;

      let result;
      if (qIndex === -1) {
        if (cornerstoneDICOMImageLoader.wadouri.metaData?.metaDataProvider) {
          result = cornerstoneDICOMImageLoader.wadouri.metaData.metaDataProvider(type, baseImageId);
        }
      } else {
        result = cornerstone.metaData.get(type, baseImageId);
      }

      // Patch imagePlaneModule for images lacking positional metadata (e.g. US)
      if (type === 'imagePlaneModule' && result) {
        if (!result.imagePositionPatient) {
          result = {
            ...result,
            imagePositionPatient: [0, 0, 0],
            imageOrientationPatient: [1, 0, 0, 0, 1, 0],
            rowCosines: [1, 0, 0],
            columnCosines: [0, 1, 0],
          };
        }
        if (!result.rowPixelSpacing || !result.columnPixelSpacing) {
          result.rowPixelSpacing = result.rowPixelSpacing || 1;
          result.columnPixelSpacing = result.columnPixelSpacing || 1;
          result.pixelSpacing = [result.rowPixelSpacing, result.columnPixelSpacing];
        }
      }

      // Patch imagePixelModule for PALETTE COLOR length mismatch bug
      if (type === 'imagePixelModule' && result) {
        if (result.photometricInterpretation === 'PALETTE COLOR') {
          if (!result.redPaletteColorLookupTableDescriptor) {
            result.redPaletteColorLookupTableDescriptor = [256, 0, 8];
            result.greenPaletteColorLookupTableDescriptor = [256, 0, 8];
            result.bluePaletteColorLookupTableDescriptor = [256, 0, 8];
          }
        }
      }

      return result;
    }
    return undefined;
  }, 10000);

  // Add tools to cornerstoneTools
  addAllTools();

  initialized = true;
}
