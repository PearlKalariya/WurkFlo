'use client';

import { useState } from 'react';
import { login, signup } from './actions';
import { Loader2, Workflow } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        const result = isLogin ? await login(formData) : await signup(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
            {/* Ambient background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/25">
                        <Workflow className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">WurkFlo</h1>
                    <p className="text-gray-400 mt-2 text-sm">Agile project management for modern teams</p>
                </div>

                {/* Card */}
                <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    {/* Tab Switch */}
                    <div className="flex bg-[#1a1a2e] rounded-xl p-1 mb-6">
                        <button
                            onClick={() => { setIsLogin(true); setError(null); }}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isLogin
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(null); }}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${!isLogin
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required={!isLogin}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                minLength={6}
                                className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-xs mt-6">
                    Built for engineering teams who ship fast.
                </p>
            </div>
        </div>
    );
}
