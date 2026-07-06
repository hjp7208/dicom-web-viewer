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
  { params }: { params: { patientId: string } },
) {
  if (!BACKEND_BASE_URL) {
    return NextResponse.json({ message: 'BACKEND_BASE_URL is not configured.' }, { status: 500 });
  }

  const patientId = params.patientId;
  if (!patientId) {
    return NextResponse.json({ message: 'patientId is required.' }, { status: 400 });
  }

  const url = `${BACKEND_BASE_URL}/api/patients/${encodeURIComponent(patientId)}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const authHeader = buildAuthHeader();
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const response = await fetch(url, { headers });
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
