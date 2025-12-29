'use client';
import ProtectedRoute from '../../components/ProtectedRoute';

import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    if (pathname === '/admin/login') {
        return <div className="min-h-screen bg-background text-foreground pt-20">{children}</div>;
    }

    return (
        <ProtectedRoute adminOnly={true}>
            <div className="min-h-screen bg-background text-foreground pt-20">
                {children}
            </div>
        </ProtectedRoute>
    );
}
