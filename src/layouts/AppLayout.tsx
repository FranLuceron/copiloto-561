import React from 'react';
import { BottomNav } from '../components/BottomNav';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[var(--color-brand-dark)] text-white font-sans flex flex-col">
            <main className="flex-1 pb-24 relative overflow-y-auto">
                {/* Padding bottom 24 (6rem) extra para que el contenido no quede oculto bajo el BottomNav físico de 4-5rem de alto */}
                {children}
            </main>
            <BottomNav />
        </div>
    );
};
