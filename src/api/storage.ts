export const getStorage = async () => {
    const res = await fetch("/api/admin/stats/storage");
    if (!res.ok) throw new Error("스토리지 정보를 불러오지 못했습니다.");
    return res.json();
};