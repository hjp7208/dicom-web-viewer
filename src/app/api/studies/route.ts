import { NextRequest, NextResponse } from 'next/server';



const buildAuthHeader = (BACKEND_BASIC_AUTH: string | undefined) => {
  if (!BACKEND_BASIC_AUTH) {
    return undefined;
  }

  if (BACKEND_BASIC_AUTH.startsWith('Basic ')) {
    return BACKEND_BASIC_AUTH;
  }

  const encoded = Buffer.from(BACKEND_BASIC_AUTH, 'utf8').toString('base64');
  return `Basic ${encoded}`;
};

export async function GET(request: NextRequest) {
  const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
  const BACKEND_BASIC_AUTH = process.env.BACKEND_BASIC_AUTH;

  if (!BACKEND_BASE_URL) {
    return NextResponse.json({ message: 'BACKEND_BASE_URL is not configured.' }, { status: 500 });
  }

  const url = `${BACKEND_BASE_URL}/api/studies${request.nextUrl.search}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const authHeader = buildAuthHeader(BACKEND_BASIC_AUTH);
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  try {
    const response = await fetch(url, { headers });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON response from backend:', text);
      return new NextResponse(text, { status: response.status || 500 });
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Fetch error in /api/studies/route.ts:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
