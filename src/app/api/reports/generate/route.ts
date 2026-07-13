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

export async function POST(request: Request) {
  if (!BACKEND_BASE_URL) {
    return NextResponse.json({ message: 'BACKEND_BASE_URL is not configured.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { studyId, userMemo } = body;

    if (!studyId) {
      return NextResponse.json({ message: 'studyId is required.' }, { status: 400 });
    }

    const url = `${BACKEND_BASE_URL}/api/reports/generate`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const authHeader = buildAuthHeader();
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ studyId, userMemo }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to generate report from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to generate report:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
