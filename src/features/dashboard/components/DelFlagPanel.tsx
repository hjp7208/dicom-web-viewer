"use client";
import { useState, useEffect } from "react";
import DelFlagCard from "./DelFlagCard";
import { getDelFlag, getDelFlagStats, restoreStudy } from "@/features/dashboard/api/delflag";

interface DelFlagItem {
    id: number;
    studyDescription: string;
    studyDate: string;
    patientId: string;
    modality: string;
    imageCount: number;
}

interface DelFlagStat {
    delFlag: boolean;
    count: number;
    totalBytes: number;
}

type Status = "loading" | "success" | "error";

export default function DelFlagPanel() {
    const [studies, setStudies] = useState<DelFlagItem[]>([]);
    const [deletedTotalBytes, setDeletedTotalBytes] = useState(0);
    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        setStatus("loading");

        Promise.all([getDelFlag(), getDelFlagStats()])
            .then(([studiesData, statsData]: [DelFlagItem[], DelFlagStat[]]) => {
                setStudies(studiesData);
                const deleted = statsData.find((s) => s.delFlag === true);
                setDeletedTotalBytes(deleted?.totalBytes ?? 0);
                setStatus("success");
            })
            .catch((e) => {
                console.error(e);
                setStatus("error");
            });
    }, []);

    const handleRestore = async (studyId: number) => {
        try {
            await restoreStudy(studyId);
            setStudies((prev) => prev.filter((s) => s.id !== studyId));

            getDelFlagStats().then((stats: DelFlagStat[]) => {
                const deleted = stats.find((s) => s.delFlag === true);
                setDeletedTotalBytes(deleted?.totalBytes ?? 0);
            }).catch(console.error);
        } catch (e) {
            console.error(e);
        }
    };

    const deletedTotalGb = (deletedTotalBytes / 1024 / 1024 / 1024).toFixed(2);

    return (
        <div className="bg-white rounded-2xl p-5 h-full">
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-sm font-medium">DELFLAG 현황</h2>
                {status === "success" && (
                    <span className="text-xs text-gray-400">대기중 {studies.length}건</span>
                )}
            </div>
            <p className="text-xs text-gray-400 mb-3">삭제 예정 용량 - {deletedTotalGb}GB</p>

            {status === "loading" && (
                <p className="text-sm text-gray-400 py-6 text-center">불러오는 중...</p>
            )}

            {status === "error" && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-3 text-center">
                    <p className="text-xs text-red-500">DELFLAG 목록을 불러오지 못했습니다.</p>
                </div>
            )}

            {status === "success" && studies.length === 0 && (
                <p className="text-sm text-gray-400 py-6 text-center">복구 대기 중인 검사가 없습니다.</p>
            )}

            {status === "success" && studies.length > 0 && (
                <div className="overflow-y-auto max-h-96">
                    {studies.map((study) => (
                        <DelFlagCard
                            key={study.id}
                            study={study}
                            onRestore={handleRestore}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}