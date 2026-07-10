export const dynamic = "force-dynamic";

export async function GET() {
    const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "https://ksw1360.asia";
    const res = await fetch(`${BACKEND_BASE_URL}/api/studies/deleted`, { cache: "no-store" });
    const data = await res.json();
    return Response.json(data);
}