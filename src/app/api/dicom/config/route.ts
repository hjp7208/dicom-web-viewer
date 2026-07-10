import { NextResponse } from 'next/server';

export async function GET() {
  const auth = process.env.BACKEND_BASIC_AUTH;
  if (!auth) {
    return NextResponse.json({ auth: '' });
  }
  
  const authStr = auth.trim();
  const finalAuth = authStr.startsWith('Basic ') 
    ? authStr 
    : `Basic ${Buffer.from(authStr, 'utf8').toString('base64')}`;
  
  return NextResponse.json({ 
    auth: finalAuth,
    baseUrl: process.env.BACKEND_BASE_URL || ''
  });
}
