import { create } from 'zustand';
import type { ActivityType, ActivitySegment, ValidationResult } from '../types';

interface CopilotState {
    currentActivity: ActivityType | null;
    activities: ActivitySegment[];
    currentShiftState: { compliance: ValidationResult } | null;

    addBlock: (type: ActivityType) => void;
    stopCurrentActivity: () => void;
    removeLastBlock: () => void;
    endShift: (userId: string) => Promise<void>;
    setActivities: (activities: ActivitySegment[]) => void;
    setStatus: (status: ValidationResult) => void;
}

export const useStore = create<CopilotState>((set, get) => ({
    currentActivity: null,
    activities: [],
    currentShiftState: { compliance: { status: 'OK', message: 'Listo para conducir' } },

    addBlock: (type) => {
        const { currentActivity, stopCurrentActivity } = get();

        // Don't restart if already in this state
        if (currentActivity === type) return;

        // Stop current activity first
        if (currentActivity) {
            stopCurrentActivity();
        }

        const newActivity: ActivitySegment = {
            id: Date.now().toString(),
            type,
            startTime: Date.now(),
            endTime: null
        };

        set({
            currentActivity: type,
            activities: [...get().activities, newActivity]
        });
    },

    stopCurrentActivity: () => {
        const { activities, currentActivity } = get();
        if (!currentActivity || activities.length === 0) return;

        const lastActivityIndex = activities.length - 1;
        const updatedActivities = [...activities];

        updatedActivities[lastActivityIndex] = {
            ...updatedActivities[lastActivityIndex],
            endTime: Date.now()
        };

        set({
            currentActivity: null,
            activities: updatedActivities
        });
    },

    removeLastBlock: () => {
        const { activities } = get();
        if (activities.length === 0) return;

        const updatedActivities = [...activities];
        updatedActivities.pop(); // Remove the absolute last block

        let newCurrentActivity = null;
        if (updatedActivities.length > 0) {
            const lastActivity = updatedActivities[updatedActivities.length - 1];
            // Si la nueva última actividad no estaba cerrada, la restauramos como activa
            if (!lastActivity.endTime) {
                newCurrentActivity = lastActivity.type;
            }
        }

        set({
            activities: updatedActivities,
            currentActivity: newCurrentActivity
        });
    },

    endShift: async (userId: string) => {
        const { activities, currentActivity, stopCurrentActivity } = get();
        if (activities.length === 0) return;

        if (currentActivity) {
            stopCurrentActivity();
        }

        const finalActivities = get().activities;

        let totalShiftMs = 0;
        let drivingMs = 0;
        let breakMs = 0;
        let restMs = 0;
        let workMs = 0;

        if (finalActivities.length > 0) {
            totalShiftMs = (finalActivities[finalActivities.length - 1].endTime || Date.now()) - finalActivities[0].startTime;
        }

        for (const act of finalActivities) {
            const duration = (act.endTime || Date.now()) - act.startTime;
            if (act.type === 'DRIVE') drivingMs += duration;
            if (act.type === 'BREAK') breakMs += duration;
            if (act.type === 'REST') restMs += duration;
            if (act.type === 'WORK') workMs += duration;
        }

        const complianceStatus = get().currentShiftState?.compliance.status || 'OK';

        try {
            const { shiftService } = await import('../services/shiftService');
            await shiftService.saveShift(userId, {
                totalShiftMs,
                drivingMs,
                breakMs,
                restMs,
                workMs,
                complianceStatus
            });
            // Una vez guardado el turno, reiniciamos el tacógrafo para el próximo día
            set({
                activities: [],
                currentActivity: null,
                currentShiftState: { compliance: { status: 'OK', message: 'Listo para conducir' } }
            });
        } catch (error) {
            console.error('Error saving shift:', error);
            // Podríamos implementar un fallback offline aquí, pero Firebase (IndexedDB) ya lo maneja si se usa onSnapshot. No obstante con addDoc internamente Firestore encola los writes.
        }
    },

    setActivities: (activities) => set({ activities }),
    setStatus: (status) => set({ currentShiftState: { compliance: status } }),
}));
