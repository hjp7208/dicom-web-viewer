export const getDelFlag = async () => {
    const res = await fetch("/api/studies/deleted");
    if (!res.ok) throw new Error("DELFLAG 정보를 불러오지 못했습니다.");
    return res.json();
};

export const getDelFlagStats = async () => {
    const res = await fetch("/api/admin/stats/delflag");
    if (!res.ok) throw new Error("DELFLAG 통계를 불러오지 못했습니다.");
    return res.json();
};

export const restoreStudy = async (studyId: number) => {
    const res = await fetch(`/api/studies/${studyId}/restore`, {
        method: "PATCH",
    });
    if (!res.ok) throw new Error("복구에 실패했습니다.");
    return res.json();
};