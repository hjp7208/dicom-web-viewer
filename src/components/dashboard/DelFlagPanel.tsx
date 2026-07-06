"use client";
import { useState, useEffect } from "react";
import DelFlagCard from "./DelFlagCard";
import { getDelFlag, restoreStudy } from "@/api/delflag";

interface DelFlagItem {
    studyId: number;
    modality: string;
    studyDate: string;
}

const mockData: DelFlagItem[] = [
    { studyId: 12345, modality: "CT", studyDate: "06.29" },
    { studyId: 12346, modality: "MR", studyDate: "06.28" },
    { studyId: 12347, modality: "CT", studyDate: "06.27" },
];

export default function DelFlagPanel() {
    const [studies, setStudies] = useState<DelFlagItem[]>(mockData);

    const handleRestore = async (studyId: number) => {
        try {
            await restoreStudy(studyId);
            setStudies((prev) => prev.filter((s) => s.studyId !== studyId));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-5 h-full">
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-sm font-medium">DELFLAG 현황</h2>
                <span className="text-xs text-gray-400">대기중 {studies.length}건</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">삭제 예정 용량 - 3.15GB</p>
            <div className="overflow-y-auto max-h-96">
                {studies.map((study) => (
                    <DelFlagCard
                        key={study.studyId}
                        study={study}
                        onRestore={handleRestore}
                    />
                ))}
            </div>
        </div>
    );
}