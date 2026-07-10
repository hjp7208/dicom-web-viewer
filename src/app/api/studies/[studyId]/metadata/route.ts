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
  if (!BACKEND_BASE_URL) {
    return NextResponse.json({ message: 'BACKEND_BASE_URL is not configured.' }, { status: 500 });
  }

  const { studyId } = params;
  if (!studyId) {
    return NextResponse.json({ message: 'studyId is required.' }, { status: 400 });
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const authHeader = buildAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/studies/${encodeURIComponent(studyId)}/metadata`, {
      headers,
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to fetch study metadata from backend:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
