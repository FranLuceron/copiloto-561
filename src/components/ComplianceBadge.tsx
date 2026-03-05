import React from 'react';

interface Props {
    status: 'OK' | 'WARNING' | 'VIOLATION' | undefined;
    message?: string;
    activityText?: string;
}

export const ComplianceBadge: React.FC<Props> = ({ status = 'OK', message, activityText }) => {
    const getBackgroundColor = () => {
        switch (status) {
            case 'OK': return 'bg-[var(--color-status-ok)]/10 border-[var(--color-status-ok)]';
            case 'WARNING': return 'bg-[var(--color-status-warn)]/10 border-[var(--color-status-warn)]';
            case 'VIOLATION': return 'bg-[var(--color-status-danger)]/10 border-[var(--color-status-danger)]';
            default: return 'bg-gray-500/10 border-gray-500';
        }
    };

    const getTextColor = () => {
        switch (status) {
            case 'OK': return 'text-[var(--color-status-ok)]';
            case 'WARNING': return 'text-[var(--color-status-warn)]';
            case 'VIOLATION': return 'text-[var(--color-status-danger)]';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className={`luxury-card border-l-4 ${getBackgroundColor()} transition-all duration-300 flex flex-col justify-center items-center py-8 relative overflow-hidden`}>
            {/* Soft Glow Effect */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${getBackgroundColor().split(' ')[0]}`} />

            <div className={`text-xs uppercase tracking-[0.2em] font-bold mb-3 ${getTextColor()}`}>
                Estado de Cumplimiento
            </div>

            <div className="text-2xl font-black text-white text-center leading-tight">
                {message || 'En línea y Preparado'}
            </div>

            {activityText && (
                <div className="mt-5 text-sm bg-black/40 px-6 py-2 rounded-full border border-white/5 flex items-center gap-2">
                    <span className="opacity-70">Actividad:</span>
                    <span className={`font-bold ${getTextColor()}`}>{activityText}</span>
                </div>
            )}
        </div>
    );
};
