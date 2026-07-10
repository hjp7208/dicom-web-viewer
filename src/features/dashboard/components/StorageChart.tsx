"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { getStorage } from "@/features/dashboard/api/storage";

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

    return (
        <div className="bg-white rounded-2xl p-5">
            <h2 className="text-sm font-medium mb-4">스토리지 가용량</h2>
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
                                <Cell fill="#6C3FC5" />
                                <Cell fill="#9CA3AF" />
                                <Cell fill="#E5E7EB" />
                            </>
                        ) : (
                            <>
                                <Cell fill="#6C3FC5" />
                                <Cell fill="#E5E7EB" />
                            </>
                        )}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} GB`]} />
                </PieChart>

                <div className="flex gap-4 mt-3 text-[10px]">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#6C3FC5]" />
                        <span className="text-gray-500">DICOM</span>
                    </div>
                    {totalCapacity && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
                            <span className="text-gray-500">시스템</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#E5E7EB]" />
                        <span className="text-gray-500">여유</span>
                    </div>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                    {dicomUsedGb.toFixed(1)} GB (DICOM) {totalCapacity ? `/ ${totalCapacity.toFixed(1)} GB (전체)` : ""}
                </p>
            </div>
        </div>
    );
}