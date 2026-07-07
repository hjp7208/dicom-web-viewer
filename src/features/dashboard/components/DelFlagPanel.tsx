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

export default function DelFlagPanel() {
    const [studies, setStudies] = useState<DelFlagItem[]>([]);
    const [deletedTotalBytes, setDeletedTotalBytes] = useState(0);

    useEffect(() => {
        getDelFlag().then(setStudies).catch(console.error);

        getDelFlagStats().then((stats: DelFlagStat[]) => {
            const deleted = stats.find((s) => s.delFlag === true);
            setDeletedTotalBytes(deleted?.totalBytes ?? 0);
        }).catch(console.error);
    }, []);

    const handleRestore = async (studyId: number) => {
        try {
            await restoreStudy(studyId);
            setStudies((prev) => prev.filter((s) => s.id !== studyId));

            // 복구 성공 후 용량 재호출
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
                <span className="text-xs text-gray-400">대기중 {studies.length}건</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">삭제 예정 용량 - {deletedTotalGb}GB</p>
            <div className="overflow-y-auto max-h-96">
                {studies.map((study) => (
                    <DelFlagCard
                        key={study.id}
                        study={study}
                        onRestore={handleRestore}
                    />
                ))}
            </div>
        </div>
    );
}