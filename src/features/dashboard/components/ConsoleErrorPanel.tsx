"use client";
import { useEffect, useState } from "react";
import { useThemeStore } from "@/features/theme/useThemeStore";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ErrorLog {
    id: number;
    message: string;
    time: string;
}

export default function ConsoleErrorPanel() {
    const [errors, setErrors] = useState<ErrorLog[]>([]);
    const { isDark } = useThemeStore();

    useEffect(() => {
        const originalError = console.error;
        let idCounter = 0;

        const addError = (message: string) => {
            setErrors((prev) => [
                { id: idCounter++, message, time: new Date().toLocaleTimeString("ko-KR") },
                ...prev,
            ].slice(0, 20));
        };

        console.error = (...args: unknown[]) => {
            originalError(...args);
            const message = args
                .map((a) => (a instanceof Error ? a.message : typeof a === "object" ? JSON.stringify(a) : String(a)))
                .join(" ");
            addError(message);
        };

        const handleWindowError = (event: ErrorEvent) => {
            addError(event.message);
        };
        const handleRejection = (event: PromiseRejectionEvent) => {
            addError(String(event.reason));
        };

        window.addEventListener("error", handleWindowError);
        window.addEventListener("unhandledrejection", handleRejection);

        return () => {
            console.error = originalError;
            window.removeEventListener("error", handleWindowError);
            window.removeEventListener("unhandledrejection", handleRejection);
        };
    }, []);

    const clearErrors = () => setErrors([]);

    return (
        <div className={`rounded-2xl p-5 border h-full flex flex-col ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-slate-100"}`}>
            <div className="flex justify-between items-center mb-3">
                <h2 className={`text-sm font-medium flex items-center gap-2 ${isDark ? "text-neutral-100" : "text-gray-900"}`}>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    콘솔 에러 로그
                </h2>
                {errors.length > 0 && (
                    <button
                        onClick={clearErrors}
                        className={`text-xs flex items-center gap-1 transition-colors ${
                            isDark ? "text-neutral-400 hover:text-white" : "text-gray-400 hover:text-gray-700"
                        }`}
                    >
                        <Trash2 className="w-3 h-3" /> 지우기
                    </button>
                )}
            </div>

            {errors.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className={`text-sm ${isDark ? "text-neutral-400" : "text-gray-400"}`}>
                        감지된 에러가 없습니다.
                    </p>
                </div>
            ) : (
                <div className="flex-1 space-y-2 overflow-y-auto">
                    {errors.map((err) => (
                        <div
                            key={err.id}
                            className={`rounded-lg px-3 py-2 border ${isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-100"}`}
                        >
                            <p className={`text-[10px] mb-1 ${isDark ? "text-neutral-500" : "text-gray-400"}`}>{err.time}</p>
                            <p className="text-xs text-red-500 font-mono break-all">{err.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}