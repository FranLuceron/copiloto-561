import { create } from 'zustand';
import type { ActivityType, ActivitySegment } from '../types';

export interface SimulationBlock {
    id: string;
    type: ActivityType;
    durationMins: number; // Duration in minutes
    customLabel?: string; // Etiqueta o nota personalizada (Ej: 400KM a 75KM/h)
}

interface SimulationState {
    blocks: SimulationBlock[];

    // Actions
    addBlock: (type: ActivityType, durationMins: number, customLabel?: string) => void;
    removeBlock: (id: string) => void;
    updateBlock: (id: string, durationMins: number) => void;
    clearBlocks: () => void;
    loadBlocks: (blocks: SimulationBlock[]) => void;

    // Helper to convert to ActivitySegment for rulesEngine
    getMockActivities: () => ActivitySegment[];
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
    blocks: [],

    addBlock: (type, durationMins, customLabel) => {
        const newBlock: SimulationBlock = {
            id: Date.now().toString(), // Simple unique ID
            type,
            durationMins,
            ...(customLabel && { customLabel })
        };
        set((state) => ({
            blocks: [...state.blocks, newBlock]
        }));
    },

    removeBlock: (id) => {
        set((state) => ({
            blocks: state.blocks.filter(b => b.id !== id)
        }));
    },

    updateBlock: (id, durationMins) => {
        set((state) => ({
            blocks: state.blocks.map(b =>
                b.id === id ? { ...b, durationMins } : b
            )
        }));
    },

    clearBlocks: () => {
        set({ blocks: [] });
    },

    loadBlocks: (blocks) => {
        set({ blocks });
    },

    getMockActivities: () => {
        const { blocks } = get();
        // Genera timestamps secuenciales asumiendo que el turno empieza 'ahora' pero en base cero real
        // Utilizamos un timestamp base ficticio (ej. media noche de hoy)
        const baseTime = new Date().setHours(0, 0, 0, 0);
        let cursorTime = baseTime;

        return blocks.map(block => {
            const startTime = cursorTime;
            const endTime = cursorTime + (block.durationMins * 60 * 1000);
            cursorTime = endTime; // Move cursor for next block

            return {
                id: block.id,
                type: block.type,
                startTime,
                endTime
            };
        });
    }
}));
