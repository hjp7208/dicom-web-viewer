"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useViewerStore } from '@/features/dicom-viewer/store/useViewerStore';

export default function Header() {
    const pathname = usePathname();
    const resetViewer = useViewerStore(state => state.resetViewer);

    const isDashboard = pathname.startsWith('/admin/dashboard');

    const handleLogoClick = () => {
        resetViewer();
    };

    const navItems = [
        { href: '/', label: '뷰어' },
        { href: '/studies', label: '검색' },
        { href: '/admin/dashboard', label: '대시보드' },
    ];

    return (
        <header
            className={`h-16 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm border-b ${
                isDashboard
                    ? "bg-white border-gray-200"
                    : "bg-neutral-900 border-neutral-800"
            }`}
        >
            <div className="flex items-center gap-12">
                <Link
                    href="/"
                    onClick={handleLogoClick}
                    className={`text-2xl font-bold tracking-widest hover:opacity-80 transition-opacity ${
                        isDashboard ? "text-blue-600" : "text-blue-500"
                    }`}
                >
                    DICOM
                </Link>

                <nav className="flex items-center gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                                    isDashboard
                                        ? isActive
                                            ? "bg-gray-100 text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                        : isActive
                                            ? "bg-neutral-800 text-white shadow-sm"
                                            : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Profile Placeholder */}
            <div className="flex items-center">
                <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-sm border cursor-pointer hover:opacity-80 transition-opacity ${
                        isDashboard ? "border-gray-200" : "border-neutral-700"
                    }`}
                ></div>
            </div>
        </header>
    );
}