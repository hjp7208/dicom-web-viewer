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

export default function UploadDetailPanel() {
    const [data, setData] = useState<MonitoringData | null>(null);
    const { isDark } = useThemeStore();

    useEffect(() => {
        getMonitoring().then(setData).catch(console.error);
    }, []);

    if (!data) {
        return (
            <div className={`rounded-2xl p-5 border ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-slate-100"}`}>
                <p className={`text-sm ${isDark ? "text-neutral-400" : "text-gray-400"}`}>불러오는 중...</p>
            </div>
        );
    }

    const { scUpload } = data;
    const hasFail = scUpload.fail > 0;

    return (
        <div className={`rounded-2xl p-5 border ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-slate-100"}`}>
            <h2 className={`text-sm font-medium mb-4 ${isDark ? "text-neutral-100" : "text-gray-900"}`}>
                SC 업로드 상세 이력
            </h2>

            {/* 마지막 성공 */}
            <div className={`flex items-start gap-3 rounded-xl px-3 py-3 mb-2 border ${
                isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-100"
            }`}>
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
                            <p className={`text-[10px] uppercase tracking-wide mb-0.5 ${isDark ? "text-neutral-500" : "text-gray-400"}`}>
                                실패 파일
                            </p>
                            <p className={`text-xs font-mono truncate px-2 py-1 rounded-md ${
                                isDark ? "bg-neutral-800 text-neutral-300" : "bg-gray-100 text-gray-700"
                            }`}>
                                {scUpload.lastFailKey}
                            </p>
                        </div>
                    )}

                    {hasFail && scUpload.lastFailReason && (
                        <div className="mt-2">
                            <p className={`text-[10px] uppercase tracking-wide mb-0.5 ${isDark ? "text-neutral-500" : "text-gray-400"}`}>
                                실패 사유
                            </p>
                            <p className="text-xs text-red-500">{scUpload.lastFailReason}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}