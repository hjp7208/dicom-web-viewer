import dicomParser from 'dicom-parser';

export interface PatientInfo {
  name: string;
  id: string;
  sex: string;
  birthDate: string;
  age: string;
}

export interface StudyInfo {
  studyInstanceUid: string;
  id: string;
  date: string;
  time: string;
  description: string;
  accessionNumber: string;
  referringPhysicianName: string;
  institutionName: string;
}

export interface ModalitySpecificInfo {
  imageLaterality: string;
  viewPosition: string;
  bodyPartExamined: string;
  sliceThickness: number;
}

export interface SeriesInfo {
  seriesInstanceUid: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  modalitySpecific: ModalitySpecificInfo;
}

export interface InstanceInfo {
  sopInstanceUid: string;
  instanceNumber: number;
  rows: number;
  columns: number;
  pixelSpacing: number[];
  windowWidth: number;
  windowLevel: number;
  rescaleSlope: number;
  rescaleIntercept: number;
  imageOrientation: number[];
  sliceLocation: number;
  pixelDataUrl: string;
  numberOfFrames: number;
}

export interface DicomFileMeta {
  file: File;
  patient: PatientInfo;
  study: StudyInfo;
  series: SeriesInfo;
  instance: InstanceInfo;
}

export interface SeriesData {
  seriesUID: string;
  patient: PatientInfo;
  study: StudyInfo;
  series: SeriesInfo;
  files: DicomFileMeta[];
  imageIds: string[]; // sorted by instanceNumber, includes multi-frame ?frame=x
}

export const parseDicomFiles = async (
  files: File[], 
  onProgress?: (parsedCount: number, totalCount: number) => void
): Promise<SeriesData[]> => {
  let parsedCount = 0;
  const totalCount = files.length;

  const metaPromises = files.map(file => {
    return new Promise<DicomFileMeta | null>((resolve) => {
      const reader = new FileReader();

      const finish = (result: DicomFileMeta | null) => {
        parsedCount++;
        if (onProgress) {
          onProgress(parsedCount, totalCount);
        }
        resolve(result);
      };

      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            finish(null);
            return;
          }

          const byteArray = new Uint8Array(arrayBuffer);
          const dataSet = dicomParser.parseDicom(byteArray);

          // Only process files that have PixelData (7FE0,0010)
          // to avoid crashing on DICOMDIR, SR, PR, etc.
          if (!dataSet.elements.x7fe00010) {
            finish(null);
            return;
          }

          // Character Set 처리 (한국어 인코딩 EUC-KR 적용)
          const charSetStr = dataSet.string('x00080005') || '';
          let decoder = new TextDecoder('euc-kr'); // 한국어 환경 기본값
          if (charSetStr.includes('ISO_IR 192') || charSetStr.includes('UTF-8')) {
            decoder = new TextDecoder('utf-8');
          }

          const getStr = (tag: string) => {
            const element = dataSet.elements[tag];
            if (!element || element.length === 0) return '';

            const bytes = dataSet.byteArray.subarray(element.dataOffset, element.dataOffset + element.length);
            let length = bytes.length;
            // DICOM 문자열 패딩(Null 또는 Space) 제거
            while (length > 0 && (bytes[length - 1] === 0x00 || bytes[length - 1] === 0x20)) {
              length--;
            }

            try {
              // 환자 이름에 포함된 ^ 구분자 등은 유지하면서 인코딩 디코딩
              return decoder.decode(bytes.subarray(0, length));
            } catch (e) {
              return dataSet.string(tag) || '';
            }
          };
          const getInt = (tag: string) => { const s = dataSet.string(tag); return s ? parseInt(s, 10) : 0; };
          const getUint16 = (tag: string) => { return dataSet.uint16(tag) || 0; };
          const getFloat = (tag: string, defaultVal = 0) => { const s = dataSet.string(tag); return s ? parseFloat(s) : defaultVal; };
          const getFloatArray = (tag: string) => {
            const s = dataSet.string(tag);
            return s ? s.split('\\').map(val => parseFloat(val)) : [];
          };

          const formatDate = (val: string) => {
            if (!val || val.length < 8) return val;
            return `${val.substring(0, 4)}-${val.substring(4, 6)}-${val.substring(6, 8)}`;
          };

          const formatTime = (val: string) => {
            if (!val || val.length < 6) return val;
            return `${val.substring(0, 2)}:${val.substring(2, 4)}:${val.substring(4, 6)}`;
          };

          const meta: DicomFileMeta = {
            file,
            patient: {
              name: getStr('x00100010'),
              id: getStr('x00100020'),
              sex: getStr('x00100040'),
              birthDate: formatDate(getStr('x00100030')),
              age: getStr('x00101010')
            },
            study: {
              studyInstanceUid: getStr('x0020000d'),
              id: getStr('x00200010'),
              date: formatDate(getStr('x00080020')),
              time: formatTime(getStr('x00080030')),
              description: getStr('x00081030'),
              accessionNumber: getStr('x00080050'),
              referringPhysicianName: getStr('x00080090'),
              institutionName: getStr('x00080080')
            },
            series: {
              seriesInstanceUid: getStr('x0020000e') || 'Unknown_Series',
              seriesNumber: getInt('x00200011'),
              seriesDescription: getStr('x0008103e'),
              modality: getStr('x00080060'),
              modalitySpecific: {
                imageLaterality: getStr('x00200062'),
                viewPosition: getStr('x00185101'),
                bodyPartExamined: getStr('x00080015'),
                sliceThickness: getFloat('x00180050')
              }
            },
            instance: {
              sopInstanceUid: getStr('x00080018'),
              instanceNumber: getInt('x00200013'),
              rows: getUint16('x00280010'),
              columns: getUint16('x00280011'),
              pixelSpacing: getFloatArray('x00280030'),
              windowWidth: getFloat('x00281051'),
              windowLevel: getFloat('x00281050'),
              rescaleSlope: getFloat('x00281053', 1),
              rescaleIntercept: getFloat('x00281052', 0),
              imageOrientation: getFloatArray('x00200037'),
              sliceLocation: getFloat('x00201041'),
              pixelDataUrl: '',
              numberOfFrames: Math.max(1, getInt('x00280008')) || 1
            }
          };

          finish(meta);
        } catch (error) {
          console.error("Error parsing DICOM file:", file.name, error);
          finish(null); // Ignore non-DICOM or corrupted files
        }
      };

      reader.onerror = () => finish(null);
      reader.readAsArrayBuffer(file);
    });
  });

  const parsedResults = await Promise.all(metaPromises);
  const validMetas = parsedResults.filter((m): m is DicomFileMeta => m !== null);

  // Group by SeriesUID
  const seriesMap = new Map<string, SeriesData>();

  validMetas.forEach(meta => {
    const groupKey = meta.series.seriesInstanceUid;

    if (!seriesMap.has(groupKey)) {
      seriesMap.set(groupKey, {
        seriesUID: groupKey,
        patient: meta.patient,
        study: meta.study,
        series: meta.series,
        files: [],
        imageIds: []
      });
    }
    seriesMap.get(groupKey)?.files.push(meta);
  });

  // Sort files within each series by instance number
  const seriesList = Array.from(seriesMap.values());
  seriesList.forEach(series => {
    series.files.sort((a, b) => a.instance.instanceNumber - b.instance.instanceNumber);
  });

  // Sort series by studyDate and then seriesNumber
  seriesList.sort((a, b) => {
    if (a.study.date !== b.study.date) {
      return a.study.date.localeCompare(b.study.date);
    }
    return a.series.seriesNumber - b.series.seriesNumber;
  });

  return seriesList;
};
