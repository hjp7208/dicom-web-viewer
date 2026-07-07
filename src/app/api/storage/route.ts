export async function GET() {
    const res = await fetch("https://ksw1360.asia/api/admin/stats/storage");
    const data = await res.json();
    return Response.json(data);
}