export const getMonitoring = async () => {
    const res = await fetch("/api/monitoring");
    if (!res.ok) throw new Error("모니터링 정보를 불러오지 못했습니다.");
    return res.json();
};