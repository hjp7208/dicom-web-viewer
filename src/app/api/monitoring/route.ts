export const dynamic = "force-dynamic";

export async function GET() {
    const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "https://api.ksw1360.asia";
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/monitoring`, { cache: "no-store" });
    const data = await res.json();
    return Response.json(data);
}