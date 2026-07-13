"use client";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "@/features/dashboard/api/storage";
import { useThemeStore } from "@/features/theme/useThemeStore";
import { FileText, Layers, Image as ImageIcon, ClipboardList } from "lucide-react";

interface DashboardSummary {
    counts: {
        studies: number;
        series: number;
        images: number;
        reports: number;
    };
    modality: {
        modality: string;
        studyCount: number;
    }[];
}

const X_RAY_MODALITIES = ["CR", "DX", "XR", "RF", "XA"];

export default function SummaryPanel() {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const { isDark } = useThemeStore();

    useEffect(() => {
        getDashboardSummary().then(setData).catch(console.error);
    }, []);

    if (!data) {
        return (
            <div className={`rounded-2xl p-5 border ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-slate-100"}`}>
                <p className={`text-sm ${isDark ? "text-neutral-400" : "text-gray-400"}`}>불러오는 중...</p>
            </div>
        );
    }

    const { counts, modality } = data;

    const countItems = [
        { label: "검사", value: counts.studies, icon: <ClipboardList className="w-4 h-4" /> },
        { label: "시리즈", value: counts.series, icon: <Layers className="w-4 h-4" /> },
        { label: "이미지", value: counts.images, icon: <ImageIcon className="w-4 h-4" /> },
        { label: "판독", value: counts.reports, icon: <FileText className="w-4 h-4" /> },
    ];

    const groupedModality = modality.reduce<{ modality: string; studyCount: number }[]>((acc, m) => {
        const upper = m.modality.toUpperCase();

        if (X_RAY_MODALITIES.includes(upper)) {
            const existing = acc.find(a => a.modality === "X-Ray");
            if (existing) existing.studyCount += m.studyCount;
            else acc.push({ modality: "X-Ray", studyCount: m.studyCount });
        } else if (["CT", "MG"].includes(upper)) {
            acc.push({ modality: m.modality, studyCount: m.studyCount });
        } else {
            const existing = acc.find(a => a.modality === "OT");
            if (existing) existing.studyCount += m.studyCount;
            else acc.push({ modality: "OT", studyCount: m.studyCount });
        }
        return acc;
    }, []);

    const maxCount = Math.max(...groupedModality.map((m) => m.studyCount), 1);

    return (
        <div className={`rounded-2xl p-5 border h-[340px] ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-slate-100"}`}>
            <h2 className={`text-sm font-medium mb-4 ${isDark ? "text-neutral-100" : "text-gray-900"}`}>
                전체 통계
            </h2>

            <div className="grid grid-cols-4 gap-2 mb-5">
                {countItems.map((item) => (
                    <div key={item.label} className={`rounded-xl p-3 text-center ${isDark ? "bg-neutral-800" : "bg-gray-50"}`}>
                        <div className={`flex justify-center mb-1 ${isDark ? "text-blue-400" : "text-blue-500"}`}>
                            {item.icon}
                        </div>
                        <p className={`text-lg font-semibold ${isDark ? "text-neutral-100" : "text-gray-900"}`}>
                            {item.value.toLocaleString()}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${isDark ? "text-neutral-500" : "text-gray-400"}`}>
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>

            <p className={`text-xs font-medium mb-2 mt-10 ${isDark ? "text-neutral-400" : "text-gray-500"}`}>
                모달리티별 검사 분포
            </p>
            <div className="space-y-2">
                {groupedModality.length === 0 && (
                    <p className={`text-xs py-2 ${isDark ? "text-neutral-500" : "text-gray-400"}`}>데이터 없음</p>
                )}
                {groupedModality.map((m) => (
                    <div key={m.modality} className="flex items-center gap-2">
                        <span className={`text-xs w-10 shrink-0 font-medium ${isDark ? "text-neutral-300" : "text-gray-700"}`}>
                            {m.modality}
                        </span>
                        <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? "bg-neutral-800" : "bg-gray-100"}`}>
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${(m.studyCount / maxCount) * 100}%` }}
                            />
                        </div>
                        <span className={`text-xs w-8 text-right shrink-0 ${isDark ? "text-neutral-400" : "text-gray-500"}`}>
                            {m.studyCount}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}