import React from 'react';
import type { ActivityType } from '../types';
import type { SimulationBlock } from '../store/useSimulationStore';
import { AlertTriangle } from 'lucide-react';

interface TimelineRendererProps {
    blocks: SimulationBlock[];
    violationBlockId?: string | null;
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

export const TimelineRenderer: React.FC<TimelineRendererProps> = ({ blocks, violationBlockId }) => {
    // Calcular el total de minutos para hacer porcentajes relativos
    const totalMins = blocks.reduce((sum, b) => sum + b.durationMins, 0);

    // Si no hay bloques, mostramos un estado vacío
    if (blocks.length === 0) {
        return (
            <div className="w-full h-12 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center text-xs text-gray-500 uppercase tracking-widest font-bold">
                Línea de tiempo vacía
            </div>
        );
    }

    return (
        <div className="w-full space-y-2">

            {/* Barra Visual */}
            <div className="flex w-full h-12 rounded-xl overflow-hidden border border-white/10 shadow-inner bg-black/50">
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

            {/* Leyenda y Marcador Total */}
            <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                <span>Inicio</span>
                <span>Total: <span className="text-white font-bold">{formatDuration(totalMins)}</span></span>
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
