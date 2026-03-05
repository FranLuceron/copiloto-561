import React, { useEffect, useState } from 'react';
import { shiftService } from '../services/shiftService';
import type { ShiftData } from '../services/shiftService';
import { auth } from '../services/firebase';
import { PlusCircle } from 'lucide-react';

const formatDuration = (ms: number) => {
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
};

export const History: React.FC = () => {
    const [shifts, setShifts] = useState<ShiftData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadShifts();
    }, []);

    const loadShifts = async () => {
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            const data = await shiftService.getRecentShifts(auth.currentUser.uid, 15);
            setShifts(data);
        } catch (error) {
            console.error('Error fetching shifts:', error);
        }
        setLoading(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:max-w-md mx-auto relative min-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold font-mono tracking-tight text-white uppercase">
                    Caja <span className="text-[var(--color-brand-primary)]">Negra</span>
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[var(--color-brand-card)] p-2 rounded-lg text-gray-300 hover:text-white border border-[var(--color-brand-border)] flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                    <PlusCircle size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Añadir</span>
                </button>
            </div>

            {loading ? (
                <div className="luxury-card p-6 text-center text-gray-400 animate-pulse border-[var(--color-brand-border)]">
                    Descargando memoria...
                </div>
            ) : shifts.length === 0 ? (
                <div className="luxury-card p-6 text-center text-gray-400 border-[var(--color-brand-border)]">
                    <p className="mb-2">No hay registros de los últimos 15 días.</p>
                    <p className="text-xs opacity-70">Pulsa el botón + para añadir un olvido físico.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {shifts.map(shift => (
                        <div key={shift.date.getTime()} className="luxury-card p-4 border-[var(--color-brand-border)] bg-gradient-to-b from-[var(--color-brand-card)] to-transparent relative group transition-all hover:border-white/10">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-sm font-bold text-gray-200 uppercase tracking-widest">
                                    {shift.date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border tracking-wider uppercase ${shift.complianceStatus === 'OK' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    shift.complianceStatus === 'WARNING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    {shift.complianceStatus}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-black/20 p-2 rounded border border-white/5">
                                    <span className="text-gray-500 text-[10px] block uppercase tracking-wider mb-1">Volante</span>
                                    <span className="font-mono text-gray-200 font-bold">{formatDuration(shift.drivingMs)}</span>
                                </div>
                                <div className="bg-black/20 p-2 rounded border border-white/5">
                                    <span className="text-gray-500 text-[10px] block uppercase tracking-wider mb-1">Descanso Diario</span>
                                    <span className="font-mono text-gray-200 font-bold">{formatDuration(shift.restMs)}</span>
                                </div>
                                <div className="bg-black/20 p-2 rounded border border-white/5">
                                    <span className="text-gray-500 text-[10px] block uppercase tracking-wider mb-1">Pausas (Cama/15')</span>
                                    <span className="font-mono text-gray-200 font-bold text-xs">{formatDuration(shift.breakMs)}</span>
                                </div>
                                <div className="bg-black/20 p-2 rounded border border-white/5">
                                    <span className="text-gray-500 text-[10px] block uppercase tracking-wider mb-1">Total Jornada</span>
                                    <span className="font-mono text-gray-200 font-bold text-xs">{formatDuration(shift.totalShiftMs)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <ManualEntryModal onClose={() => setShowModal(false)} onSaved={loadShifts} />
            )}
        </div>
    );
};

const ManualEntryModal: React.FC<{ onClose: () => void, onSaved: () => void }> = ({ onClose, onSaved }) => {
    // Valores por defecto sugeridos para un olvido (9H estandarizada de conduccion)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [drivingHours, setDrivingHours] = useState('9');
    const [restHours, setRestHours] = useState('11');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!auth.currentUser) return;
        setIsSaving(true);
        const drivingMs = parseFloat(drivingHours) * 60 * 60 * 1000;
        const restMs = parseFloat(restHours) * 60 * 60 * 1000;
        const breakMs = 45 * 60 * 1000; // Asumimos pausa legal min obligatoria en un día estandar

        await shiftService.saveShift(auth.currentUser.uid, {
            date: new Date(date),
            drivingMs,
            breakMs,
            restMs,
            workMs: 0,
            totalShiftMs: drivingMs + breakMs + restMs, // Simplificación para caja negra
            complianceStatus: 'OK' // Asumimos que si lo registra manualmente, era un turno OK. Modificable a futuro.
        });
        setIsSaving(false);
        onSaved();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-[#111] border border-[var(--color-brand-border)] shadow-2xl p-6 rounded-2xl w-full max-w-sm relative">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest font-mono border-b border-white/10 pb-2">Registro de Olvido</h3>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Fecha de la Jornada</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-black border border-[var(--color-brand-border)] rounded-lg p-3 text-white focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] outline-none transition-all font-mono text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Hrs Conducción</label>
                            <input
                                type="number"
                                value={drivingHours}
                                onChange={e => setDrivingHours(e.target.value)}
                                step="0.5"
                                min="0" max="10"
                                className="w-full bg-black border border-[var(--color-brand-border)] rounded-lg p-3 text-white focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] outline-none transition-all font-mono text-sm text-center"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Hrs Descanso</label>
                            <input
                                type="number"
                                value={restHours}
                                onChange={e => setRestHours(e.target.value)}
                                step="0.5"
                                min="0" max="48"
                                className="w-full bg-black border border-[var(--color-brand-border)] rounded-lg p-3 text-white focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] outline-none transition-all font-mono text-sm text-center"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex-1 p-3 border border-white/10 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all text-sm font-bold tracking-wider uppercase disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 p-3 bg-[var(--color-brand-primary)] text-black rounded-lg transition-all text-sm font-bold tracking-widest uppercase hover:bg-yellow-400 active:scale-95 disabled:opacity-50 flex justify-center items-center"
                    >
                        {isSaving ? 'Guardando...' : 'Inyectar'}
                    </button>
                </div>
            </div>
        </div>
    );
};
