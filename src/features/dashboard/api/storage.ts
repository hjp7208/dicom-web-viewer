export const getStorage = async () => {
    const res = await fetch("/api/storage");
    if (!res.ok) throw new Error("스토리지 정보를 불러오지 못했습니다.");
    return res.json();
};

export const getDashboardSummary = async () => {
    const res = await fetch("/api/dashboard-summary");
    if (!res.ok) throw new Error("대시보드 요약 정보를 불러오지 못했습니다.");
    return res.json();
};