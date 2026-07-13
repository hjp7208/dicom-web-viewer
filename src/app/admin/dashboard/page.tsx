"use client";

import Header from "@/components/layout/Header";
import StorageChart from "@/features/dashboard/components/StorageChart";
import DelFlagPanel from "@/features/dashboard/components/DelFlagPanel";
import ErrorMonitor from "@/features/dashboard/components/ErrorMonitor";
import { useThemeStore } from "@/features/theme/useThemeStore";

export default function DashboardPage() {
    const { isDark } = useThemeStore();

    return (
        <div className={`flex gap-4 p-10 h-[calc(100vh-4rem)] items-center justify-center overflow-hidden ${
            isDark ? "bg-black" : "bg-gray-100"
        }`}>
            <div className="flex flex-col gap-4 w-80 shrink-0">
                <StorageChart />
                <ErrorMonitor />
            </div>
                <div className="w-[600px]" style={{ height: '660px' }}>
                    <DelFlagPanel />
                </div>
            </div>
    );
}