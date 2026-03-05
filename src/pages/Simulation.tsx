import React, { useState, useEffect } from 'react';
import { shiftService } from '../services/shiftService';
import { auth } from '../services/firebase';
import { calculateContinuousDrive, calculateDailyDrive } from '../utils/rulesEngine';
import type { ValidationResult, ActivitySegment } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const Simulation: React.FC = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const [startTime, setStartTime] = useState('06:00');
    const [driveHours, setDriveHours] = useState('4.5');
    const [breakStrategy, setBreakStrategy] = useState<'STANDARD' | 'SPLIT'>('STANDARD');
    const [simResult, setSimResult] = useState<ValidationResult | null>(null);
    const [simDetails, setSimDetails] = useState('');

    useEffect(() => {
        loadAverages();
    }, []);

    const loadAverages = async () => {
        if (!auth.currentUser) return;
        setIsLoading(true);
        try {
            const avgDriveMs = await shiftService.getAverageDrivingMs(auth.currentUser.uid);
            const avgHours = (avgDriveMs / 3600000).toFixed(1);
            setDriveHours(avgHours > '10' ? '9.0' : avgHours);

            const now = new Date();
            setStartTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    const handleSimulate = () => {
        const baseTime = Date.now();
        let activities: ActivitySegment[] = [];
        const driveMs = parseFloat(driveHours) * 60 * 60 * 1000;

        // Construcción de maqueta de segmentos de tacógrafo en base a la estrategia
        if (breakStrategy === 'STANDARD') {
            const firstDriveMs = Math.min(driveMs, 4.5 * 60 * 60 * 1000);
            activities.push({ id: '1', type: 'DRIVE', startTime: baseTime, endTime: baseTime + firstDriveMs });

            const breakTime = baseTime + firstDriveMs;
            activities.push({ id: '2', type: 'BREAK', startTime: breakTime, endTime: breakTime + (45 * 60 * 1000) });

            if (driveMs > firstDriveMs) {
                const secondStart = breakTime + (45 * 60 * 1000);
                activities.push({ id: '3', type: 'DRIVE', startTime: secondStart, endTime: secondStart + (driveMs - firstDriveMs) });
            }
        } else {
            // Split 15+30
            const firstDriveMs = Math.min(driveMs, 2 * 60 * 60 * 1000); // Conduce primeras 2 horas
            activities.push({ id: '1', type: 'DRIVE', startTime: baseTime, endTime: baseTime + firstDriveMs });

            let cursorTime = baseTime + firstDriveMs;
            activities.push({ id: '2', type: 'BREAK', startTime: cursorTime, endTime: cursorTime + (15 * 60 * 1000) }); // Pausa 15m
            cursorTime += (15 * 60 * 1000);

            if (driveMs > firstDriveMs) {
                const secondDriveMs = Math.min(driveMs - firstDriveMs, 2.5 * 60 * 60 * 1000); // Conduce 2.5h
                activities.push({ id: '3', type: 'DRIVE', startTime: cursorTime, endTime: cursorTime + secondDriveMs });
                cursorTime += secondDriveMs;

                if (driveMs > (firstDriveMs + secondDriveMs)) {
                    activities.push({ id: '4', type: 'BREAK', startTime: cursorTime, endTime: cursorTime + (30 * 60 * 1000) }); // Pausa 30m
                    cursorTime += (30 * 60 * 1000);

                    const thirdDriveMs = driveMs - (firstDriveMs + secondDriveMs);
                    activities.push({ id: '5', type: 'DRIVE', startTime: cursorTime, endTime: cursorTime + thirdDriveMs }); // Conduce resto
                }
            }
        }

        const finalTime = activities.length > 0 ? (activities[activities.length - 1].endTime || baseTime) : baseTime;
        const continuousResult = calculateContinuousDrive(activities, finalTime);
        const dailyResult = calculateDailyDrive({
            totalDriveMinutes: driveMs / 60000,
            isExtendedDriveUsed: false,
            totalBreakMinutes: 0,
            totalRestMinutes: 0,
            totalWorkMinutes: 0,
            continuousDriveMinutes: 0,
            startDate: baseTime
        });

        if (continuousResult.status === 'VIOLATION' || dailyResult.status === 'VIOLATION') {
            setSimResult({ status: 'VIOLATION', message: '¡Infracción! Este plan supera los límites legales.' });
            setSimDetails(continuousResult.status === 'VIOLATION' ? continuousResult.message : dailyResult.message);
        } else if (continuousResult.status === 'WARNING' || dailyResult.status === 'WARNING') {
            setSimResult({ status: 'WARNING', message: 'Plan viable pero al límite de la normativa.' });
            setSimDetails(continuousResult.status === 'WARNING' ? continuousResult.message : dailyResult.message);
        } else {
            setSimResult({ status: 'OK', message: 'Plan Legal Correcto. Normativa 561/2006.' });
            setSimDetails('Tiempos de conducción y pausas en márgenes seguros.');
        }

        setStep(3);
    };

    return (
        <div className="p-4 sm:p-6 lg:max-w-md mx-auto relative min-h-[80vh] flex flex-col">
            <h1 className="text-2xl font-bold font-mono tracking-tight text-white mb-6 uppercase flex items-center gap-2">
                Simulador <span className="text-blue-400">Inteligente</span> <Sparkles className="text-blue-400" size={20} />
            </h1>

            <div className="flex-1 flex flex-col">
                {isLoading ? (
                    <div className="luxury-card p-6 text-center text-gray-400 animate-pulse border-[var(--color-brand-border)]">
                        Inicializando Inteligencia Predictiva...
                    </div>
                ) : (
                    <>
                        {/* WIZARD STEP 1 */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
                                <div className="luxury-card p-6 border-[var(--color-brand-border)] mb-4 flex-1">
                                    <h2 className="text-gray-300 font-bold mb-4 uppercase tracking-widest text-sm">Paso 1: Arranque</h2>
                                    <p className="text-sm text-gray-400 mb-6">¿A qué hora estimas arrancar el motor para este turno?</p>

                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full bg-black/50 border border-[var(--color-brand-border)] rounded-xl p-4 text-white text-2xl font-mono text-center focus:border-blue-500 outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <button onClick={() => setStep(2)} className="w-full bg-blue-500 hover:bg-blue-400 text-black font-bold uppercase tracking-widest p-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                    Siguiente <ArrowRight size={18} />
                                </button>
                            </div>
                        )}

                        {/* WIZARD STEP 2 */}
                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
                                <div className="luxury-card p-6 border-[var(--color-brand-border)] mb-4 flex-1 overflow-y-auto">
                                    <div className="flex items-center gap-2 mb-4">
                                        <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white p-1 bg-white/5 rounded"><ArrowLeft size={16} /></button>
                                        <h2 className="text-gray-300 font-bold uppercase tracking-widest text-sm">Paso 2: Ruta y Pausas</h2>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-xs text-blue-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Sparkles size={12} /> Sugerencia basada en tu historial
                                        </label>
                                        <div className="flex items-center gap-4 bg-black/30 border border-white/5 p-4 rounded-xl">
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={driveHours}
                                                onChange={(e) => setDriveHours(e.target.value)}
                                                className="w-20 bg-transparent text-white text-2xl font-mono text-center border-b border-gray-600 focus:border-blue-500 outline-none"
                                            />
                                            <span className="text-gray-400 font-bold tracking-widest uppercase">Horas Volante</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Estrategia de Pausa</label>

                                        <div
                                            onClick={() => setBreakStrategy('STANDARD')}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${breakStrategy === 'STANDARD' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-black/30 border-white/5 hover:border-white/20'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border ${breakStrategy === 'STANDARD' ? 'border-[4px] border-blue-400 bg-black' : 'border-gray-600'}`}></div>
                                            <div>
                                                <span className="block text-white font-bold text-sm">Estándar (45 min)</span>
                                                <span className="block text-gray-500 text-[10px] uppercase">Gastar 4.5h continuas al límite</span>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setBreakStrategy('SPLIT')}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${breakStrategy === 'SPLIT' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-black/30 border-white/5 hover:border-white/20'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border ${breakStrategy === 'SPLIT' ? 'border-[4px] border-blue-400 bg-black' : 'border-gray-600'}`}></div>
                                            <div>
                                                <span className="block text-white font-bold text-sm">Fraccionada (15 + 30 min)</span>
                                                <span className="block text-gray-500 text-[10px] uppercase">Partir el turno en dos pedazos seguros</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleSimulate} className="w-full bg-blue-500 hover:bg-blue-400 text-black font-bold uppercase tracking-widest p-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                    Simular Jornada
                                </button>
                            </div>
                        )}

                        {/* WIZARD STEP 3 (Result) */}
                        {step === 3 && simResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
                                <div className={`luxury-card p-6 border-t-4 mb-4 flex-1 text-center justify-center flex flex-col items-center ${simResult.status === 'OK' ? 'border-t-green-500' :
                                    simResult.status === 'WARNING' ? 'border-t-amber-500' :
                                        'border-t-red-500'
                                    }`}>

                                    {simResult.status === 'OK' && <CheckCircle2 size={64} className="text-green-400 mb-4 animate-bounce" />}
                                    {simResult.status === 'WARNING' && <AlertTriangle size={64} className="text-amber-400 mb-4 animate-pulse" />}
                                    {simResult.status === 'VIOLATION' && <AlertTriangle size={64} className="text-red-500 mb-4 animate-bounce" />}

                                    <h2 className="text-white font-bold text-xl mb-2">{simResult.message}</h2>
                                    <p className="text-gray-400 text-sm mb-6 max-w-[250px]">{simDetails}</p>

                                    <div className="w-full bg-black/40 p-4 rounded-xl border border-white/5 text-left mb-6">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 border-b border-white/5 pb-2">Resumen de Parámetros</p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-gray-400">Arranque:</span>
                                            <span className="text-white font-mono text-right">{startTime}</span>
                                            <span className="text-gray-400">Conducción:</span>
                                            <span className="text-white font-mono text-right">{driveHours} Hrs</span>
                                            <span className="text-gray-400">Estrategia:</span>
                                            <span className="text-white font-mono text-right">
                                                {breakStrategy === 'STANDARD' ? '45 min' : '15 + 30 min'}
                                            </span>
                                        </div>
                                    </div>

                                </div>

                                <div className="text-[10px] text-gray-500 uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-1 font-bold">
                                    <Info size={12} /> Esta es una estimación. Ante dudas, consulta el tacógrafo real.
                                </div>

                                <button onClick={() => setStep(1)} className="w-full bg-transparent border border-gray-600 text-gray-300 hover:text-white font-bold uppercase tracking-widest p-4 rounded-xl flex justify-center items-center transition-all">
                                    Nueva Simulación
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
