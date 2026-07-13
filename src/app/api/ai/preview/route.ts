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
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!BACKEND_BASE_URL) {
    return NextResponse.json({ message: 'BACKEND_BASE_URL is not configured.' }, { status: 500 });
  }

  if (!path) {
    return NextResponse.json({ message: 'path is required.' }, { status: 400 });
  }

  const url = `${BACKEND_BASE_URL}/api/ai/preview?path=${encodeURIComponent(path)}`;
  const headers: Record<string, string> = {};

  const authHeader = buildAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch preview from backend' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error("Failed to fetch ai preview from backend:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
