import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <Sidebar />
            <div className="pl-[240px] transition-all duration-300">
                <Header
                    userEmail={user?.email}
                    userName={user?.user_metadata?.full_name}
                />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
