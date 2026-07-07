export async function GET() {
    const res = await fetch("https://ksw1360.asia/api/studies/deleted");
    const data = await res.json();
    return Response.json(data);
}