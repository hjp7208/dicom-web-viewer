"use client";

import StorageChart from "@/features/dashboard/components/StorageChart";
import DelFlagPanel from "@/features/dashboard/components/DelFlagPanel";
import ErrorMonitor from "@/features/dashboard/components/ErrorMonitor";
import UploadDetailPanel from "@/features/dashboard/components/UploadDetailPanel";
import ConsoleErrorPanel from "@/features/dashboard/components/ConsoleErrorPanel";
import SummaryPanel from "@/features/dashboard/components/SummaryPanel";
import { useThemeStore } from "@/features/theme/useThemeStore";

export default function DashboardPage() {
    const { isDark } = useThemeStore();

    return (
        <div className={`flex gap-4 p-10 min-h-[calc(100vh-4rem)] items-stretch justify-center ${
            isDark ? "bg-black" : "bg-gray-100"
        }`}>
            <div className="flex flex-col gap-4 w-80 shrink-0">
                <SummaryPanel />
                <StorageChart />
                <ErrorMonitor />
            </div>

            <div className="flex flex-col gap-4 w-[420px] shrink-0">
                <UploadDetailPanel />
                <div className="flex-1">
                    <ConsoleErrorPanel />
                </div>
            </div>

            <div className="w-[420px] shrink-0">
                <DelFlagPanel />
            </div>
        </div>
    );
}