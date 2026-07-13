"use client";
import { useEffect, useState } from "react";
import { getMonitoring } from "@/features/dashboard/api/monitoring";
import { useThemeStore } from "@/features/theme/useThemeStore";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

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
        lastSuccessAt?: string;
        lastFailAt?: string;
        lastFailKey?: string;
        lastFailReason?: string;
    };
}

const healthLabel = (status: string) => status === "UP" ? "정상" : "오류";
const healthColor = (status: string) => status === "UP" ? "text-green-500" : "text-red-500";

const formatDateTime = (value?: string) => {
    if (!value) return "기록 없음";
    try {
        const date = new Date(value);
        return date.toLocaleString("ko-KR", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return value;
    }
};

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
    const hasFail = scUpload.fail > 0;

    return (
        <div className={`rounded-2xl p-5 border ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-slate-100"}`}>
            <h2 className={`text-sm font-medium mb-3 ${isDark ? "text-neutral-100" : "text-gray-900"}`}>
                장애 모니터링
            </h2>

            {/* 헬스체크 */}
            <div className="flex flex-col gap-2 mb-4">
                {(
                    [
                        ["앱 서버", health.app],
                        ["데이터베이스", health.db],
                        ["S3 스토리지", health.s3],
                    ] as [string, string][]
                ).map(([label, status]) => (
                    <div key={label} className={`flex justify-between items-center border rounded-xl px-3 py-2 text-sm ${isDark ? "border-neutral-700 text-neutral-300" : "border-gray-100 text-gray-700"}`}>
                        <span>{label}</span>
                        <span className={healthColor(status)}>{healthLabel(status)}</span>
                    </div>
                ))}
            </div>

            {/* SC 업로드 현황 */}
            <p className={`text-xs font-medium mb-2 mt-10 ${isDark ? "text-neutral-400" : "text-gray-500"}`}>
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

            <p className={`text-xs font-medium mb-2 mt-10 ${isDark ? "text-neutral-400" : "text-gray-500"}`}>
                SC 업로드 상세 이력
            </p>
            {/* 마지막 성공 */}
            <div className={`flex items-start gap-3 rounded-xl px-3 py-3 mb-2 border ${isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-100"}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                    <p className={`text-xs font-medium ${isDark ? "text-neutral-200" : "text-gray-800"}`}>마지막 성공</p>
                    <p className={`text-xs mt-0.5 flex items-center gap-1 ${isDark ? "text-neutral-400" : "text-gray-500"}`}>
                        <Clock className="w-3 h-3" />
                        {formatDateTime(scUpload.lastSuccessAt)}
                    </p>
                </div>
            </div>

            {/* 마지막 실패 */}
            <div className={`flex items-start gap-3 rounded-xl px-3 py-3 border ${
                hasFail
                    ? (isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-100")
                    : (isDark ? "bg-neutral-800/50 border-neutral-700" : "bg-gray-50 border-gray-100")
            }`}>
                <XCircle className={`w-4 h-4 mt-0.5 shrink-0 ${hasFail ? "text-red-500" : (isDark ? "text-neutral-600" : "text-gray-300")}`} />
                <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium ${isDark ? "text-neutral-200" : "text-gray-800"}`}>마지막 실패</p>
                    <p className={`text-xs mt-0.5 flex items-center gap-1 ${isDark ? "text-neutral-400" : "text-gray-500"}`}>
                        <Clock className="w-3 h-3" />
                        {formatDateTime(scUpload.lastFailAt)}
                    </p>
                    {hasFail && scUpload.lastFailKey && (
                        <div className="mt-2">
                            <p className={`text-[10px] uppercase tracking-wide mb-0.5 ${isDark ? "text-neutral-500" : "text-gray-400"}`}>실패 파일</p>
                            <p className={`text-xs font-mono truncate px-2 py-1 rounded-md ${isDark ? "bg-neutral-800 text-neutral-300" : "bg-gray-100 text-gray-700"}`}>
                                {scUpload.lastFailKey}
                            </p>
                        </div>
                    )}
                    {hasFail && scUpload.lastFailReason && (
                        <div className="mt-2">
                            <p className={`text-[10px] uppercase tracking-wide mb-0.5 ${isDark ? "text-neutral-500" : "text-gray-400"}`}>실패 사유</p>
                            <p className="text-xs text-red-500">{scUpload.lastFailReason}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}