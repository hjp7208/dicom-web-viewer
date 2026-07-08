import Header from "@/components/layout/Header";
import StorageChart from "@/features/dashboard/components/StorageChart";
import DelFlagPanel from "@/features/dashboard/components/DelFlagPanel";
import ErrorMonitor from "@/features/dashboard/components/ErrorMonitor";

export default function DashboardPage() {
    return (
        <>
            <Header />
            <div className="flex gap-4 pt-16 px-10 pb-10 bg-gray-100 justify-center">
                <div className="flex flex-col gap-4 w-80 shrink-0">
                    <StorageChart />
                    <ErrorMonitor />
                </div>
                <div className="w-[600px] self-stretch">
                    <DelFlagPanel />
                </div>
            </div>
        </>
    );
}