import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import { addAllTools } from '../features/dicom-viewer/utils/cornerstoneToolsUtil';

let initialized = false;

export default async function initCornerstone() {
  if (initialized) {
    return;
  }

  // Cornerstone Core Initialization
  await cornerstone.init();

  // Cornerstone Tools Initialization
  await cornerstoneTools.init();

  // 백엔드 직접 프록시 다운로드를 위한 Authorization 헤더 가져오기
  let authHeader = '';
  try {
    const configRes = await fetch('/api/dicom/config');
    if (configRes.ok) {
      const configData = await configRes.json();
      if (configData.auth) {
        authHeader = configData.auth;
      }
      if (configData.baseUrl) {
        // @ts-expect-error - Custom window property for direct download
        window.__DICOM_BASE_URL__ = configData.baseUrl;
      }
    }
  } catch (err) {
    console.error('Failed to load dicom auth header', err);
  }

  // Initialize the image loader with its default configuration
  // 최신 버전의 Cornerstone에서는 configure 대신 init()의 옵션으로 beforeSend를 전달합니다.
  cornerstoneDICOMImageLoader.init({
    maxWebWorkers: navigator.hardwareConcurrency ? Math.min(navigator.hardwareConcurrency, 7) : 1,
    beforeSend: function (xhr: XMLHttpRequest, imageId: string) {
      // S3 Pre-signed URL로 전환될 경우 대비 (S3 URL에는 Authorization 헤더가 들어가면 에러 발생)
      const isS3Url = imageId && (imageId.includes('X-Amz-Signature') || imageId.includes('s3.amazonaws.com') || imageId.includes('s3.ap-northeast-2.amazonaws.com'));
      
      if (authHeader && !isS3Url) {
        xhr.setRequestHeader('Authorization', authHeader);
      }
    }
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
