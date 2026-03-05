import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Sparkles } from 'lucide-react';

export const BottomNav: React.FC = () => {
    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
        { to: '/history', icon: History, label: 'Historial' },
        { to: '/simulation', icon: Sparkles, label: 'Simulador' }
    ];

    return (
        <nav className="fixed bottom-0 w-full bg-[var(--color-brand-card)] border-t border-[var(--color-brand-border)] pb-safe pt-2 px-6 z-50">
            <ul className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <li key={to} className="flex-1">
                        <NavLink
                            to={to}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all ${isActive
                                    ? 'text-[var(--color-brand-primary)]'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={24}
                                        className={`transition-all ${isActive ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] scale-110' : ''}`}
                                    />
                                    <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                        {label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
