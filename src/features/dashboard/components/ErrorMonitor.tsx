"use client";
import { useEffect, useState } from "react";
import { getMonitoring } from "@/features/dashboard/api/monitoring";
import { useThemeStore } from "@/features/theme/useThemeStore";

interface MonitoringData {
    status: string;
    health: {
        app: string;
        db: string;
        s3: string;
    };
    scUpload: {
        success: number;
        fail: number;
        total: number;
        successRate: number;
        lastFailReason: string;
    };
}

const healthLabel = (status: string) => status === "UP" ? "정상" : "오류";
const healthColor = (status: string) =>
    status === "UP" ? "text-green-500" : "text-red-500";

export default function ErrorMonitor() {
    const [data, setData] = useState<MonitoringData | null>(null);
    const { isDark } = useThemeStore();

    useEffect(() => {
        getMonitoring().then(setData).catch(console.error);
    }, []);

    if (!data) return (
        <div className={`rounded-2xl p-5 border ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-slate-100"}`}>
            <p className={`text-sm ${isDark ? "text-neutral-400" : "text-gray-400"}`}>불러오는 중...</p>
        </div>
    );

    const { health, scUpload } = data;

    return (
        <div className={`rounded-2xl p-5 border ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-slate-100"}`}>
            <h2 className={`text-sm font-medium mb-3 ${isDark ? "text-neutral-100" : "text-gray-900"}`}>
                장애 모니터링
            </h2>
            <div className="flex flex-col gap-2 mb-4">
                {(
                    [
                        ["앱 서버", health.app],
                        ["데이터베이스", health.db],
                        ["S3 스토리지", health.s3],
                    ] as [string, string][]
                ).map(([label, status]) => (
                    <div
                        key={label}
                        className={`flex justify-between items-center border rounded-xl px-3 py-2 text-sm ${isDark ? "border-neutral-700 text-neutral-300" : "border-gray-100 text-gray-700"}`}
                    >
                        <span>{label}</span>
                        <span className={healthColor(status)}>{healthLabel(status)}</span>
                    </div>
                ))}
            </div>
            <div>
                <p className={`text-xs font-medium mb-2 ${isDark ? "text-neutral-400" : "text-gray-500"}`}>
                    SC 업로드 현황
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                        ["성공", scUpload.success, "text-green-500"],
                        ["실패", scUpload.fail, "text-red-500"],
                        ["성공률", `${Math.round(scUpload.successRate * 100)}%`, isDark ? "text-neutral-200" : "text-gray-700"],
                    ].map(([label, value, color]) => (
                        <div key={label as string} className={`rounded-xl p-2 text-center ${isDark ? "bg-neutral-800" : "bg-gray-50"}`}>
                            <p className={`text-xs mb-1 ${isDark ? "text-neutral-400" : "text-gray-400"}`}>{label}</p>
                            <p className={`text-lg font-medium ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>
                {scUpload.lastFailReason && (
                    <div className={`border rounded-xl px-3 py-2 ${isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"}`}>
                        <p className="text-xs font-medium text-red-500 mb-1">마지막 실패 사유</p>
                        <p className="text-xs text-red-500">{scUpload.lastFailReason}</p>
                    </div>
                )}
            </div>
        </div>
    );
}