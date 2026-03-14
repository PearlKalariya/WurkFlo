'use client';

import { logout } from '@/app/login/actions';
import { LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
    userEmail?: string;
    userName?: string;
}

export default function Header({ userEmail, userName }: HeaderProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <header className="h-16 border-b border-white/[0.06] bg-[#0d0d14]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-20">
            <div />

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {userName ? userName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm text-gray-300 hidden sm:block">
                        {userName || userEmail || 'User'}
                    </span>
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a2e] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                            <p className="text-sm text-white font-medium">{userName || 'User'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
                        </div>
                        <form action={logout}>
                            <button
                                type="submit"
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-red-400 hover:bg-white/[0.04] transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </header>
    );
}
