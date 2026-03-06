import React from 'react';
import type { ActivityType } from '../types';
import type { SimulationBlock } from '../store/useSimulationStore';
import { AlertTriangle } from 'lucide-react';

interface TimelineRendererProps {
    blocks: SimulationBlock[];
    violationBlockId?: string | null;
    offsetMins?: number;
}

const getColorForType = (type: ActivityType) => {
    switch (type) {
        case 'DRIVE': return 'bg-[var(--color-state-drive)]';
        case 'BREAK': return 'bg-[var(--color-state-break)]';
        case 'REST': return 'bg-[var(--color-state-rest)]';
        case 'WORK': return 'bg-[var(--color-state-work)]';
        default: return 'bg-gray-500';
    }
};

const getLabelForType = (type: ActivityType) => {
    switch (type) {
        case 'DRIVE': return 'Conducción';
        case 'BREAK': return 'Pausa';
        case 'REST': return 'Descanso';
        case 'WORK': return 'Otros';
        default: return 'Desconocido';
    }
};

const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    if (hours > 0) {
        return `${hours}h ${m > 0 ? `${m}m` : ''}`;
    }
    return `${m}m`;
};

export const TimelineRenderer: React.FC<TimelineRendererProps> = ({ blocks, violationBlockId, offsetMins = 0 }) => {
    // Calcular el total de minutos para hacer porcentajes relativos
    const totalMins = blocks.reduce((sum, b) => sum + b.durationMins, 0) + offsetMins;

    // Si no hay bloques ni offset, mostramos un estado vacío
    if (totalMins === 0) {
        return (
            <div className="w-full h-12 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center text-xs text-gray-500 uppercase tracking-widest font-bold">
                Línea de tiempo vacía
            </div>
        );
    }

    return (
        <div className="w-full space-y-2">

            {/* Configuración Visual del Offset */}
            <div className="flex justify-between items-center text-xs font-mono text-gray-400 mb-1">
                <span>{offsetMins > 0 ? `Inicio: +${formatDuration(offsetMins)}` : 'Inicio'}</span>
                <span>Total Jornada: <span className="text-white font-bold">{formatDuration(totalMins)}</span></span>
            </div>

            {/* Barra Visual */}
            <div className="flex w-full h-12 rounded-xl overflow-hidden border border-white/10 shadow-inner bg-black/50">
                {offsetMins > 0 && (
                    <div
                        style={{ width: `${Math.max((offsetMins / totalMins) * 100, 2)}%` }}
                        className="h-full bg-white/10 opacity-70 border-r border-black/30 flex items-center justify-center cursor-help"
                        title={`Conducción Previa Declarada: ${formatDuration(offsetMins)}`}
                    >
                        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cGF0aCBkPSJNMCA0TDQgMFpNMCAwTDRfNE0wIDJM4PMgMlpNMCA0TDQgNFpNMiA0TDQgMlpNMCAyTDIgMFpNMiAwTDAgMloiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjI1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-50 mix-blend-overlay"></div>
                    </div>
                )}

                {blocks.map((block) => {
                    const widthPercent = Math.max((block.durationMins / totalMins) * 100, 2); // Minimum width 2% for visibility
                    const isViolation = block.id === violationBlockId;

                    return (
                        <div
                            key={`timeline-${block.id}`}
                            style={{ width: `${widthPercent}%` }}
                            className={`h-full ${getColorForType(block.type)} ${isViolation ? 'animate-pulse ring-inset ring-4 ring-red-500/80 brightness-110 relative' : 'opacity-90'} border-r border-black/20 last:border-r-0 transition-all duration-300 group hover:opacity-100 cursor-help flex items-center justify-center`}
                            title={`${getLabelForType(block.type)}: ${formatDuration(block.durationMins)}`}
                        >
                            {/* Inner icon/warning if wide enough */}
                            {isViolation && widthPercent > 10 && (
                                <AlertTriangle size={16} className="text-white drop-shadow-md" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Aviso explícito de infracción si la hay */}
            {violationBlockId && (
                <div className="mt-2 text-[10px] text-red-500 flex justify-end font-bold uppercase tracking-wider items-center gap-1 animate-in fade-in">
                    <AlertTriangle size={10} /> El bloque resaltado supera el límite permitido
                </div>
            )}

        </div>
    );
};
