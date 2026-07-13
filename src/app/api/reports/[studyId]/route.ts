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

export async function GET(
  _request: Request,
  { params }: { params: { studyId: string } },
) {
  const { studyId } = params;

  if (!BACKEND_BASE_URL) {
    return NextResponse.json({ message: 'BACKEND_BASE_URL is not configured.' }, { status: 500 });
  }

  if (!studyId) {
    return NextResponse.json({ message: 'studyId is required.' }, { status: 400 });
  }

  const url = `${BACKEND_BASE_URL}/api/reports/${encodeURIComponent(studyId)}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const authHeader = buildAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  try {
    const response = await fetch(url, { headers });
    
    // If response is not ok, throw error or return it
    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch report from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch report from backend:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
