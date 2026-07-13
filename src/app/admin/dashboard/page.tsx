"use client";

import StorageChart from "@/features/dashboard/components/StorageChart";
import DelFlagPanel from "@/features/dashboard/components/DelFlagPanel";
import ErrorMonitor from "@/features/dashboard/components/ErrorMonitor";
import ConsoleErrorPanel from "@/features/dashboard/components/ConsoleErrorPanel";
import SummaryPanel from "@/features/dashboard/components/SummaryPanel";
import { useThemeStore } from "@/features/theme/useThemeStore";

export default function DashboardPage() {
    const { isDark } = useThemeStore();

    return (
        <div className={`flex gap-4 p-10 min-h-[calc(100vh-4rem)] items-stretch justify-center ${
            isDark ? "bg-black" : "bg-gray-100"
        }`}>
            {/* 왼쪽 */}
            <div className="flex flex-col gap-4 w-80 shrink-0">
                <StorageChart />
                <SummaryPanel />
            </div>

            {/* 가운데 */}
            <div className="flex flex-col gap-4 w-96 shrink-0">
                <ErrorMonitor />
                <ConsoleErrorPanel />
            </div>

            {/* 오른쪽 */}
            <div className="flex flex-col gap-4 w-[420px] shrink-0">
                <div className="flex-1">
                    <DelFlagPanel />
                </div>
            </div>

        </div>
    );
}