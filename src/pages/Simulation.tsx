import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import { calculateContinuousDrive, calculateDailyDrive } from '../utils/rulesEngine';
import type { ValidationResult, ActivityType, FrequentRoute } from '../types';
import { TimelineRenderer } from '../components/TimelineRenderer';
import { Sparkles, Info, Trash2, Play, Coffee, Briefcase, Bed, RefreshCcw, AlertTriangle, CheckCircle2, Save, Download } from 'lucide-react';
import { auth } from '../services/firebase';
import { shiftService } from '../services/shiftService';

export const Simulation: React.FC = () => {
    const { blocks, addBlock, removeBlock, clearBlocks, getMockActivities, loadBlocks } = useSimulationStore();
    const [simResult, setSimResult] = useState<ValidationResult | null>(null);
    const [simDetails, setSimDetails] = useState('');
    const [violationBlockId, setViolationBlockId] = useState<string | null>(null);
    const [customMins, setCustomMins] = useState<number>(45);
    const [savedRoutes, setSavedRoutes] = useState<FrequentRoute[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSavedRoutes();
    }, []);

    const loadSavedRoutes = async () => {
        if (!auth.currentUser) return;
        try {
            const routes = await shiftService.getFrequentRoutes(auth.currentUser.uid);
            setSavedRoutes(routes);
        } catch (error) {
            console.error('Error loading routes:', error);
        }
    };

    const handleSaveRoute = async () => {
        if (!auth.currentUser || blocks.length === 0) return;
        const routeName = window.prompt('Introduce un nombre para esta ruta frecuente:');
        if (!routeName?.trim()) return;

        setIsSaving(true);
        try {
            await shiftService.saveFrequentRoute(auth.currentUser.uid, routeName.trim(), blocks);
            alert('Ruta guardada correctamente.');
            loadSavedRoutes();
        } catch (error) {
            console.error('Error saving route:', error);
            alert('Error al guardar la ruta.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoadRoute = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const routeId = e.target.value;
        if (!routeId) return;

        const route = savedRoutes.find(r => r.id === routeId);
        if (route) {
            loadBlocks(route.blocks);
        }
        e.target.value = ''; // Reset select
    };

    useEffect(() => {
        runSimulation();
    }, [blocks]);

    const runSimulation = () => {
        if (blocks.length === 0) {
            setSimResult(null);
            setSimDetails('');
            setViolationBlockId(null);
            return;
        }

        const activities = getMockActivities();

        let violationId = null;
        let finalResult: ValidationResult = { status: 'OK', message: 'Plan Legal Correcto. Normativa 561/2006.' };
        let finalDetails = 'Tiempos de conducción y pausas en márgenes seguros.';

        let totalDriveMinutes = 0;
        let totalBreakMinutes = 0;
        let totalRestMinutes = 0;
        let totalWorkMinutes = 0;

        for (let i = 0; i < activities.length; i++) {
            const subActivities = activities.slice(0, i + 1);
            const blockFinalTime = subActivities[subActivities.length - 1].endTime || Date.now();
            const act = subActivities[subActivities.length - 1];

            const duration = (act.endTime! - act.startTime) / 60000;
            if (act.type === 'DRIVE') totalDriveMinutes += duration;
            if (act.type === 'BREAK') totalBreakMinutes += duration;
            if (act.type === 'REST') totalRestMinutes += duration;
            if (act.type === 'WORK') totalWorkMinutes += duration;

            const continuousResult = calculateContinuousDrive(subActivities, blockFinalTime);

            // Creamos un baseline de baseTime para calcular si la jornada excedió los límites
            const dailyResult = calculateDailyDrive({
                totalDriveMinutes,
                isExtendedDriveUsed: false,
                totalBreakMinutes,
                totalRestMinutes,
                totalWorkMinutes,
                continuousDriveMinutes: 0,
                startDate: activities[0].startTime
            });

            if (continuousResult.status === 'VIOLATION' || dailyResult.status === 'VIOLATION') {
                violationId = act.id;
                finalResult = { status: 'VIOLATION', message: '¡Infracción! Este plan supera los límites legales.' };
                finalDetails = continuousResult.status === 'VIOLATION' ? continuousResult.message : dailyResult.message;
                break; // Stop evaluating further to highlight the exact block
            } else if (continuousResult.status === 'WARNING' || dailyResult.status === 'WARNING') {
                finalResult = { status: 'WARNING', message: 'Plan viable pero al límite de la normativa.' };
                finalDetails = continuousResult.status === 'WARNING' ? continuousResult.message : dailyResult.message;
            }
        }

        setViolationBlockId(violationId);
        setSimResult(finalResult);
        setSimDetails(finalDetails);
    };

    const handleAddBlock = (type: ActivityType, mins: number) => {
        if (mins > 0) {
            addBlock(type, mins);
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

    const getIconForType = (type: ActivityType) => {
        switch (type) {
            case 'DRIVE': return <Play size={16} />;
            case 'BREAK': return <Coffee size={16} />;
            case 'REST': return <Bed size={16} />;
            case 'WORK': return <Briefcase size={16} />;
        }
    };

    const getLabelForType = (type: ActivityType) => {
        switch (type) {
            case 'DRIVE': return 'Conducción';
            case 'BREAK': return 'Pausa';
            case 'REST': return 'Descanso';
            case 'WORK': return 'Otros Trabajos';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:max-w-md mx-auto relative min-h-[80vh] flex flex-col pb-24 space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase flex items-center gap-2">
                    Constructor <span className="text-blue-400">Jornada</span> <Sparkles className="text-blue-400" size={18} />
                </h1>
                <div className="flex gap-2">
                    {blocks.length > 0 && (
                        <>
                            <button
                                onClick={handleSaveRoute}
                                disabled={isSaving}
                                className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 p-2 rounded-lg border border-blue-500/20 disabled:opacity-50"
                                title="Guardar Ruta Frecuente"
                            >
                                <Save size={16} />
                            </button>
                            <button
                                onClick={clearBlocks}
                                className="text-gray-400 hover:text-red-400 transition-colors bg-black/30 p-2 rounded-lg border border-white/5"
                                title="Limpiar Simulación"
                            >
                                <RefreshCcw size={16} />
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Route Selector */}
            {savedRoutes.length > 0 && (
                <section className="animate-in fade-in">
                    <div className="relative">
                        <select
                            onChange={handleLoadRoute}
                            defaultValue=""
                            className="w-full appearance-none bg-black/40 border border-white/10 text-white text-sm rounded-xl px-4 py-3 pr-10 outline-none focus:border-blue-500/50 transition-colors"
                        >
                            <option value="" disabled>Cargar ruta frecuente...</option>
                            {savedRoutes.map(route => (
                                <option key={route.id} value={route.id}>{route.routeName}</option>
                            ))}
                        </select>
                        <Download size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </section>
            )}

            {/* Timeline View */}
            <section className="luxury-card border-[var(--color-brand-border)] p-5 animate-in fade-in slide-in-from-top-4">
                <h2 className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-4">Línea de Tiempo Visual</h2>
                <TimelineRenderer blocks={blocks} violationBlockId={violationBlockId} />
            </section>

            {/* Global Result Card */}
            {simResult && blocks.length > 0 && (
                <section className={`animate-in fade-in zoom-in duration-300 luxury-card p-4 border flex items-start gap-3 shadow-xl ${simResult.status === 'OK' ? 'border-l-4 border-l-green-500 bg-green-500/5 border-green-500/10' :
                    simResult.status === 'WARNING' ? 'border-l-4 border-l-amber-500 bg-amber-500/5 border-amber-500/10' :
                        'border-l-4 border-l-red-500 bg-red-500/5 border-red-500/10'
                    }`}>
                    <div className="mt-1">
                        {simResult.status === 'OK' && <CheckCircle2 size={24} className="text-green-500" />}
                        {simResult.status === 'WARNING' && <AlertTriangle size={24} className="text-amber-500" />}
                        {simResult.status === 'VIOLATION' && <AlertTriangle size={24} className="text-red-500 animate-pulse" />}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm tracking-wide mb-1 uppercase">{simResult.message}</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">{simDetails}</p>
                    </div>
                </section>
            )}

            {/* Blocks List */}
            <section className="flex-1 space-y-2 animate-in fade-in">
                <h2 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 pl-1">Bloques de la Jornada</h2>

                {blocks.length === 0 ? (
                    <div className="text-center p-8 bg-black/20 rounded-xl border border-white/5 border-dashed">
                        <p className="text-gray-500 text-sm">Añade bloques abajo para construir el turno paso a paso.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2 pb-2">
                        {blocks.map((block, index) => (
                            <div
                                key={block.id}
                                className={`flex items-center justify-between p-3 rounded-xl bg-black/40 border transition-all ${block.id === violationBlockId ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : 'border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${block.type === 'DRIVE' ? 'bg-[var(--color-state-drive)]/20 text-[var(--color-state-drive)]' :
                                        block.type === 'BREAK' ? 'bg-[var(--color-state-break)]/20 text-[var(--color-state-break)]' :
                                            block.type === 'REST' ? 'bg-[var(--color-state-rest)]/20 text-[var(--color-state-rest)]' :
                                                'bg-[var(--color-state-work)]/20 text-[var(--color-state-work)]'
                                        }`}>
                                        {getIconForType(block.type)}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">
                                            {index + 1}. {getLabelForType(block.type)}
                                        </p>
                                        <p className="text-gray-400 text-xs font-mono">
                                            {formatDuration(block.durationMins)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeBlock(block.id)}
                                    className="p-2 text-gray-500 hover:text-red-400 transition-colors hover:bg-red-500/10 rounded-lg group"
                                    aria-label="Eliminar bloque"
                                    title="Eliminar este bloque"
                                >
                                    <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Builder Controls */}
            <section className="bg-[var(--color-brand-card)] p-4 rounded-[var(--radius-luxury)] border border-[var(--color-brand-border)] animate-in slide-in-from-bottom-8">
                <div className="flex items-center justify-between mb-4 bg-black/30 p-2 rounded-xl border border-white/5">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider pl-2">Duración:</span>
                    <div className="flex items-center">
                        <input
                            type="number"
                            min="1"
                            max="1440"
                            value={customMins}
                            onChange={(e) => setCustomMins(parseInt(e.target.value) || 0)}
                            className="w-16 bg-transparent text-white font-mono text-center text-lg outline-none focus:text-blue-400 transition-colors border-b border-gray-600 focus:border-blue-400 mr-2"
                        />
                        <span className="text-xs text-gray-500 pr-2 uppercase">min</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleAddBlock('DRIVE', customMins)}
                        className="p-3 bg-[var(--color-state-drive)]/10 text-[var(--color-state-drive)] border border-[var(--color-state-drive)]/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[var(--color-state-drive)]/20 transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    >
                        <Play size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Conducción</span>
                    </button>

                    <button
                        onClick={() => handleAddBlock('BREAK', customMins)}
                        className="p-3 bg-[var(--color-state-break)]/10 text-[var(--color-state-break)] border border-[var(--color-state-break)]/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[var(--color-state-break)]/20 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                    >
                        <Coffee size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Pausa</span>
                    </button>

                    <button
                        onClick={() => handleAddBlock('WORK', customMins)}
                        className="p-3 bg-[var(--color-state-work)]/10 text-[var(--color-state-work)] border border-[var(--color-state-work)]/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[var(--color-state-work)]/20 transition-all active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.05)] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                    >
                        <Briefcase size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Otros</span>
                    </button>

                    <button
                        onClick={() => handleAddBlock('REST', customMins)}
                        className="p-3 bg-[var(--color-state-rest)]/10 text-[var(--color-state-rest)] border border-[var(--color-state-rest)]/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[var(--color-state-rest)]/20 transition-all active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    >
                        <Bed size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Descanso</span>
                    </button>
                </div>
            </section>

            <div className="text-[10px] text-gray-500 uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-1 font-bold">
                <Info size={12} /> Estimación visual predictiva.
            </div>
        </div>
    );
};
