import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { Play, Coffee, Bed, Briefcase, LogOut, AlertTriangle, RotateCcw } from 'lucide-react';
import { ComplianceBadge } from './ComplianceBadge';

// Aisla el re-render por segundo solo a la hora del Header
const HeaderClock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    return <>{time.toLocaleTimeString([], { hour12: false })}</>;
};

// Aisla el re-render por segundo solo al BigTimer (cuando hay actividad en curso)
const ActivityTimer: React.FC = () => {
    const currentActivitySession = useStore(state => state.activities[state.activities.length - 1]);
    const currentActivity = useStore(state => state.currentActivity);
    const checkCompliance = useStore(state => state.checkCompliance);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!currentActivity || (currentActivitySession && currentActivitySession.endTime)) return;
        const timer = setInterval(() => {
            setNow(Date.now());
            checkCompliance();
        }, 1000);
        return () => clearInterval(timer);
    }, [currentActivity, currentActivitySession, checkCompliance]);

    let currentTimerDisplay = "00:00:00";
    if (currentActivity && currentActivitySession && !currentActivitySession.endTime) {
        const elapsedMs = now - currentActivitySession.startTime;
        const hrs = Math.floor(elapsedMs / 3600000).toString().padStart(2, '0');
        const mins = Math.floor((elapsedMs % 3600000) / 60000).toString().padStart(2, '0');
        const secs = Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, '0');
        currentTimerDisplay = `${hrs}:${mins}:${secs}`;
    }

    return (
        <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-white">
            {currentTimerDisplay}
        </div>
    );
};

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    // El Dashboard base solo re-renderiza cuando hay cambio de estado global (clicks de botones)
    const currentActivity = useStore(state => state.currentActivity);
    const currentShiftState = useStore(state => state.currentShiftState);
    const addBlock = useStore(state => state.addBlock);
    const removeLastBlock = useStore(state => state.removeLastBlock);
    const hasActivities = useStore(state => state.activities.length > 0);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    const getActivityText = () => {
        switch (currentActivity) {
            case 'DRIVE': return 'Conduciendo';
            case 'BREAK': return 'En Pausa';
            case 'REST': return 'Descansando';
            case 'WORK': return 'Otros Trabajos';
            default: return 'En Espera';
        }
    };

    // State loading check para evitar crash
    if (!currentShiftState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-dark)]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 border-t-2 border-b-2 border-white rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-mono text-sm">Cargando Kiosco...</p>
                </div>
            </div>
        );
    }

    const { status, message } = currentShiftState.compliance;

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-brand-dark)] p-4 sm:p-6 lg:max-w-md lg:mx-auto space-y-6 pb-28">

            {/* Header */}
            <header className="flex justify-between items-center bg-[var(--color-brand-card)] p-4 rounded-2xl border border-[var(--color-brand-border)]">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        {/* Logo Copiloto / Empresa A.M.A */}
                        <div className="h-8 bg-white/5 rounded-lg border border-white/10 px-2 py-1 flex items-center justify-center overflow-hidden">
                            <img src="https://i.imgur.com/kS9O3zO.png" alt="A.M.A Logo" className="h-full object-contain" />
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center">
                            CONDUCTOR
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate w-32 sm:w-48 text-gray-200">
                            {auth.currentUser?.email || 'Demo Usuario'}
                        </span>
                        <button onClick={handleLogout} className="text-red-400/80 hover:text-red-400 transition-colors p-1 bg-red-500/10 rounded-lg ml-2" aria-label="Cerrar Sesión">
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/20 text-white font-mono font-bold tracking-widest text-lg md:text-xl shadow-inner flex items-center justify-center drop-shadow-md">
                        <HeaderClock />
                    </div>
                </div>
            </header>

            {/* Main Panel: Semáforo y Alertas */}
            <section className="flex flex-col gap-4">
                <ComplianceBadge
                    status={status}
                    message={message}
                    activityText={getActivityText()}
                />

                {/* Banner de alerta pequeña si existe advertencia */}
                {status === 'WARNING' && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-xl flex items-center gap-3 text-sm animate-in fade-in zoom-in duration-300">
                        <AlertTriangle size={18} className="flex-shrink-0" />
                        <p className="leading-tight">Atención: Revisa tus tiempos de pausa legal próximos.</p>
                    </div>
                )}
                {status === 'VIOLATION' && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-xl flex items-center gap-3 text-sm animate-in fade-in zoom-in duration-300 shadow-lg shadow-red-500/5">
                        <AlertTriangle size={18} className="flex-shrink-0" />
                        <p className="leading-tight">Infracción detectada. Estaciona el vehículo de forma segura de inmediato.</p>
                    </div>
                )}
            </section>

            {/* Big Timer */}
            <section className="luxury-card flex flex-col items-center justify-center py-8 border-[var(--color-brand-border)] bg-gradient-to-b from-[var(--color-brand-card)] to-black/40 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/[0.02] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.05] to-transparent pointer-events-none" />
                <div className="flex items-center gap-3 z-10 mb-3">
                    <h2 className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">
                        En Curso ({getActivityText()})
                    </h2>
                    {hasActivities && (
                        <button
                            onClick={removeLastBlock}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-full border border-red-500/20 transition-all opacity-80 hover:opacity-100"
                            title="Eliminar último registro (Corrección)"
                            aria-label="Deshacer último bloque"
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}
                </div>
                <div className="z-10 drop-shadow-xl">
                    <ActivityTimer />
                </div>
            </section>

            {/* Footer / Botones Kiosco Mobile-First */}
            <section className="grid grid-cols-2 gap-3 sm:gap-4 mt-auto">
                <button
                    onClick={() => addBlock('DRIVE')}
                    aria-label="Iniciar Conducción"
                    className={`flex flex-col items-center justify-center p-4 min-h-[100px] rounded-[20px] transition-all duration-200 border ${currentActivity === 'DRIVE'
                        ? 'bg-[var(--color-state-drive)]/10 border-[var(--color-state-drive)] text-[var(--color-state-drive)] shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[0.98]'
                        : 'bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-gray-400 hover:border-white/10 active:scale-95'
                        }`}
                >
                    <Play size={28} className="mb-3 opacity-90" />
                    <span className="font-bold text-sm tracking-wide">Conducir</span>
                </button>

                <button
                    onClick={() => addBlock('BREAK')}
                    aria-label="Iniciar Pausa"
                    className={`flex flex-col items-center justify-center p-4 min-h-[100px] rounded-[20px] transition-all duration-200 border ${currentActivity === 'BREAK'
                        ? 'bg-[var(--color-state-break)]/10 border-[var(--color-state-break)] text-[var(--color-state-break)] shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[0.98]'
                        : 'bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-gray-400 hover:border-white/10 active:scale-95'
                        }`}
                >
                    <Coffee size={28} className="mb-3 opacity-90" />
                    <span className="font-bold text-sm tracking-wide text-center">Pausa<br /><span className="text-[10px] opacity-70 font-normal tracking-wider">45' / 15'</span></span>
                </button>

                <button
                    onClick={() => addBlock('WORK')}
                    aria-label="Registrar Otros Trabajos"
                    className={`flex flex-col items-center justify-center p-4 min-h-[100px] rounded-[20px] transition-all duration-200 border ${currentActivity === 'WORK'
                        ? 'bg-[var(--color-state-work)]/10 border-[var(--color-state-work)] text-[var(--color-state-work)] shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[0.98]'
                        : 'bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-gray-400 hover:border-white/10 active:scale-95'
                        }`}
                >
                    <Briefcase size={28} className="mb-3 opacity-90" />
                    <span className="font-bold text-sm tracking-wide">Otros</span>
                </button>

                <button
                    onClick={() => addBlock('REST')}
                    aria-label="Iniciar Descanso Diario"
                    className={`flex flex-col items-center justify-center p-4 min-h-[100px] rounded-[20px] transition-all duration-200 border ${currentActivity === 'REST'
                        ? 'bg-[var(--color-state-rest)]/10 border-[var(--color-state-rest)] text-[var(--color-state-rest)] shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[0.98]'
                        : 'bg-[var(--color-brand-card)] border-[var(--color-brand-border)] text-gray-400 hover:border-white/10 active:scale-95'
                        }`}
                >
                    <Bed size={28} className="mb-3 opacity-90" />
                    <span className="font-bold text-sm tracking-wide text-center">Descanso<br /><span className="text-[10px] opacity-70 font-normal tracking-wider">11h / 9h</span></span>
                </button>
            </section>

            {/* Stop Action */}
            {currentActivity && (
                <button
                    onClick={() => useStore.getState().endShift(auth.currentUser?.uid as string)}
                    aria-label="Finalizar Actividad Actual y Guardar Turno"
                    className="w-full bg-[#1A0A0A] border border-red-500/20 text-red-400 rounded-[20px] py-4 font-bold tracking-[0.2em] text-sm hover:bg-red-500/10 active:scale-95 transition-all outline-none mt-2 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                >
                    FINALIZAR TURNO
                </button>
            )}

        </div>
    );
};
