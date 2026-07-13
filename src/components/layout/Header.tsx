"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useViewerStore } from '@/features/dicom-viewer/store/useViewerStore';
import { useThemeStore } from '@/features/theme/useThemeStore';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const resetViewer = useViewerStore(state => state.resetViewer);
    const { isDark, toggleTheme } = useThemeStore();

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
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-200"
            }`}
        >
            <div className="flex items-center gap-12">
                <Link
                    href="/"
                    onClick={handleLogoClick}
                    className={`text-xl font-bold tracking-widest hover:opacity-80 transition-opacity ${
                        isDark ? "text-blue-500" : "text-blue-600"
                    }`}
                >
                    DICOM AI Viewer
                </Link>

                <nav className="flex items-center gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                                    isDark
                                        ? isActive
                                            ? "bg-neutral-800 text-white shadow-sm"
                                            : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                                        : isActive
                                            ? "bg-gray-100 text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <button
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isDark
                        ? "bg-neutral-800 text-yellow-400 hover:bg-neutral-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
        </header>
    );
}