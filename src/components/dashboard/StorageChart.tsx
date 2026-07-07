"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { getStorage } from "@/api/storage";

interface StorageData {
    dbGb: number;
    s3Gb: number;
    totalGb: number;
}

export default function StorageChart() {
    const [data, setData] = useState<StorageData | null>(null);

    useEffect(() => {
        getStorage().then(setData).catch(console.error);
    }, []);

    const usedGb = data?.totalGb ?? 0;
    const totalCapacity = 9.8;
    const freeGb = totalCapacity - usedGb;

    const chartData = [
        { name: "사용 중", value: usedGb },
        { name: "여유", value: freeGb },
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
                        <Cell fill="#6C3FC5" />
                        <Cell fill="#E0E0E0" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} GB`]} />
                </PieChart>
                <p className="text-xs text-gray-400 mt-2">{usedGb.toFixed(1)} GB / {totalCapacity} GB</p>
            </div>
        </div>
    );
}