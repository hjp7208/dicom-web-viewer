"use client";
import { useState } from "react";
import { useThemeStore } from "@/features/theme/useThemeStore";

interface Study {
    id: number;
    studyDescription: string;
    studyDate: string;
    patientId: string;
    modality: string;
    imageCount: number;
}

export default function DelFlagCard({
                                        study,
                                        onRestore,
                                    }: {
    study: Study;
    onRestore: (studyId: number) => void;
}) {
    const [showModal, setShowModal] = useState(false);
    const { isDark } = useThemeStore();

    return (
        <>
            <div className={`border rounded-xl p-3 mb-2 ${isDark ? "border-neutral-700" : "border-gray-100"}`}>
                <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${isDark ? "text-neutral-200" : "text-gray-900"}`}>
                        {study.patientId}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                        대기중
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDark ? "text-neutral-400" : "text-gray-400"}`}>
                        {study.modality} · {study.studyDate?.slice(0, 10) ?? '-'}
                    </span>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-xs text-purple-400"
                    >
                        복구
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className={`rounded-2xl p-6 w-72 shadow-lg ${isDark ? "bg-neutral-800" : "bg-white"}`}>
                        <p className={`text-sm font-medium mb-1 ${isDark ? "text-neutral-100" : "text-gray-900"}`}>
                            검사를 복구하시겠습니까?
                        </p>
                        <p className={`text-xs mb-6 ${isDark ? "text-neutral-400" : "text-gray-400"}`}>
                            {study.patientId} · {study.modality}
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className={`text-xs px-4 py-2 rounded-lg border ${isDark ? "border-neutral-600 text-neutral-300" : "border-gray-200 text-gray-500"}`}
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    onRestore(study.id);
                                    setShowModal(false);
                                }}
                                className="text-xs px-4 py-2 rounded-lg bg-purple-600 text-white"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}