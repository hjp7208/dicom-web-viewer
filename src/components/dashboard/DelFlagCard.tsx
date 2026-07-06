"use client";
import { useState } from "react";

interface Study {
    studyId: number;
    modality: string;
    studyDate: string;
}

export default function DelFlagCard({
                                        study,
                                        onRestore,
                                    }: {
    study: Study;
    onRestore: (studyId: number) => void;
}) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="border border-gray-100 rounded-xl p-3 mb-2">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">ST-{study.studyId}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
                        대기중
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                        {study.modality} - {study.studyDate}
                    </span>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-xs text-purple-600"
                    >
                        복구
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-72 shadow-lg">
                        <p className="text-sm font-medium mb-1">검사를 복구하시겠습니까?</p>
                        <p className="text-xs text-gray-400 mb-6">ST-{study.studyId} · {study.modality}</p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-500"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    onRestore(study.studyId);
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