"use client";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
      <p className="mb-3 text-sm font-semibold text-blue-950">검사 날짜 범위</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label htmlFor="startDate" className="text-sm font-medium text-slate-700">
          시작일
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-blue-100 bg-white px-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label htmlFor="endDate" className="text-sm font-medium text-slate-700">
          종료일
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-blue-100 bg-white px-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>
    </div>
  );
}
