import { create } from 'zustand';
import type { ActivityType, ActivitySegment, ValidationResult } from '../types';

interface CopilotState {
    currentActivity: ActivityType | null;
    activities: ActivitySegment[];
    currentShiftState: { compliance: ValidationResult } | null;

    addBlock: (type: ActivityType) => void;
    stopCurrentActivity: () => void;
    removeLastBlock: () => void;
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

    setActivities: (activities) => set({ activities }),
    setStatus: (status) => set({ currentShiftState: { compliance: status } }),
}));
