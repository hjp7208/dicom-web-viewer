"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { getStorage } from "@/features/dashboard/api/storage";
import { useThemeStore } from "@/features/theme/useThemeStore";

interface StorageData {
    dbGb: number;
    s3Gb: number;
    totalGb: number;
    diskTotalGb: number;
    diskFreeGb: number;
    diskUsedPercent: number;
}

export default function StorageChart() {
    const [data, setData] = useState<StorageData | null>(null);
    const { isDark } = useThemeStore();

    useEffect(() => {
        getStorage().then(setData).catch(console.error);
    }, []);

    const dicomUsedGb = data?.totalGb ?? 0;
    const totalCapacity = data?.diskTotalGb && data.diskTotalGb > 0 ? data.diskTotalGb : null;
    const realFreeGb = data?.diskFreeGb ?? 0;
    const systemUsedGb = totalCapacity ? Math.max(0, totalCapacity - realFreeGb - dicomUsedGb) : 0;

    const chartData = totalCapacity
        ? [
            { name: "DICOM 데이터", value: dicomUsedGb },
            { name: "기타 시스템", value: systemUsedGb },
            { name: "여유 공간", value: realFreeGb },
        ]
        : [
            { name: "사용 중", value: dicomUsedGb },
            { name: "여유", value: 1 },
        ];

    const freeColor = isDark ? "#3F3F46" : "#E5E7EB";
    const systemColor = isDark ? "#6B7280" : "#9CA3AF";

    return (
        <div className={`rounded-2xl p-5 border ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-slate-100"}`}>
            <h2 className={`text-sm font-medium mb-4 ${isDark ? "text-neutral-100" : "text-gray-900"}`}>
                스토리지 가용량
            </h2>
            <div className="flex flex-col items-center">
                <PieChart width={200} height={200}>
                    <Pie
                        data={chartData}
                        cx={100}
                        cy={100}
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        startAngle={90}
                        endAngle={450}
                    >
                        {totalCapacity ? (
                            <>
                                <Cell fill="#3B82F6" />
                                <Cell fill={systemColor} />
                                <Cell fill={freeColor} />
                            </>
                        ) : (
                            <>
                                <Cell fill="#3B82F6" />
                                <Cell fill={freeColor} />
                            </>
                        )}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} GB`]} />
                </PieChart>

                <div className="flex gap-4 mt-3 text-[10px]">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                        <span className={isDark ? "text-neutral-400" : "text-gray-500"}>DICOM</span>
                    </div>
                    {totalCapacity && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: systemColor }} />
                            <span className={isDark ? "text-neutral-400" : "text-gray-500"}>시스템</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: freeColor }} />
                        <span className={isDark ? "text-neutral-400" : "text-gray-500"}>여유</span>
                    </div>
                </div>

                <p className={`text-xs mt-2 ${isDark ? "text-neutral-400" : "text-gray-400"}`}>
                    {dicomUsedGb.toFixed(1)} GB (DICOM) {totalCapacity ? `/ ${totalCapacity.toFixed(1)} GB (전체)` : ""}
                </p>
            </div>
        </div>
    );
}