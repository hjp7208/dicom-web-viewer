import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
const BACKEND_BASIC_AUTH = process.env.BACKEND_BASIC_AUTH;

const buildAuthHeader = () => {
  if (!BACKEND_BASIC_AUTH) {
    return undefined;
  }

  const authStr = BACKEND_BASIC_AUTH.trim();
  if (authStr.startsWith('Basic ')) {
    return authStr;
  }

  const encoded = Buffer.from(authStr, 'utf8').toString('base64');
  return `Basic ${encoded}`;
};

export async function GET(request: Request) {
  if (!BACKEND_BASE_URL) {
    return new NextResponse('BACKEND_BASE_URL is not configured.', { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return new NextResponse('path is required.', { status: 400 });
  }

  const url = `${BACKEND_BASE_URL}/api/dicom/download?path=${encodeURIComponent(path)}`;
  const headers: Record<string, string> = {};

  const authHeader = buildAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  try {
    console.log("Downloading DICOM from backend URL:", url);
    const response = await fetch(url, { 
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Backend responded with status: ${response.status}`, await response.text());
      return new NextResponse(`Backend responded with status: ${response.status}`, { status: response.status });
    }

    // 파일 스트림(버퍼)를 그대로 프론트엔드로 전달
    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/dicom',
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to download DICOM from backend:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
