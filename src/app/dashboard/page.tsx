import StorageChart from "@/components/dashboard/StorageChart";
import DelFlagPanel from "@/components/dashboard/DelFlagPanel";
import ErrorMonitor from "@/components/dashboard/ErrorMonitor";

export default function DashboardPage() {
    return (
        <div className="flex gap-8 p-10 bg-gray-100 items-stretch justify-center">
            <div className="flex flex-col gap-8 w-80 shrink-0">
                <StorageChart />
                <ErrorMonitor />
            </div>
            <div className="w-[600px]">
                <DelFlagPanel />
            </div>
        </div>
    );
}