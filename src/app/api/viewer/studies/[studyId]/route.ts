import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
const BACKEND_BASIC_AUTH = process.env.BACKEND_BASIC_AUTH;

const buildAuthHeader = () => {
  if (!BACKEND_BASIC_AUTH) {
    return undefined;
  }

  if (BACKEND_BASIC_AUTH.startsWith('Basic ')) {
    return BACKEND_BASIC_AUTH;
  }

  const encoded = Buffer.from(BACKEND_BASIC_AUTH, 'utf8').toString('base64');
  return `Basic ${encoded}`;
};

export async function GET(
  _request: Request,
  { params }: { params: { studyId: string } },
) {
  const { studyId } = params;

  // 포트폴리오용 임시 테스트 데이터 반환 로직 (Swagger의 StudyMetadataResponse 스키마에 맞춤)
  if (studyId === 'test') {
    return NextResponse.json({
      studyInstanceUid: "1.2.840.113619.2.5.1762583153.215519.978957063.78",
      patient: {
        patientId: "PORTFOLIO_001",
        patientName: "Portfolio^Patient",
        patientSex: "M",
        patientBirthDate: "1990-01-01"
      },
      study: {
        studyInstanceUid: "1.2.840.113619.2.5.1762583153.215519.978957063.78",
        studyDate: "2024-05-01",
        studyTime: "120000",
        accessionNumber: "ACC123456",
        studyDescription: "CT ABDOMEN",
        institutionName: "Portfolio Hospital"
      },
      seriesList: [
        {
          seriesInstanceUid: "1.2.840.113619.2.5.1762583153.215519.978957063.79",
          seriesNumber: 1,
          seriesDescription: "Axial C+",
          modality: "CT",
          modalitySpecific: {
            sliceThickness: 5.0
          },
          instances: [
            {
              sopInstanceUid: "1.2.840.10008.1.1.1",
              instanceNumber: 1,
              pixelDataUrl: "https://dcm-test-public.s3.ap-northeast-2.amazonaws.com/test-dicom/0001.dcm"
            },
            {
              sopInstanceUid: "1.2.840.10008.1.1.2",
              instanceNumber: 2,
              pixelDataUrl: "https://dcm-test-public.s3.ap-northeast-2.amazonaws.com/test-dicom/0002.dcm"
            },
            {
              sopInstanceUid: "1.2.840.10008.1.1.3",
              instanceNumber: 3,
              pixelDataUrl: "https://dcm-test-public.s3.ap-northeast-2.amazonaws.com/test-dicom/0003.dcm"
            }
          ]
        }
      ]
    });
  }

  // 실제 백엔드 연동
  if (!BACKEND_BASE_URL) {
    return NextResponse.json({ message: 'BACKEND_BASE_URL is not configured.' }, { status: 500 });
  }

  if (!studyId) {
    return NextResponse.json({ message: 'studyId is required.' }, { status: 400 });
  }

  const url = `${BACKEND_BASE_URL}/api/studies/${encodeURIComponent(studyId)}/metadata`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const authHeader = buildAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch metadata from backend:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
