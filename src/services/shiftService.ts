import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp, doc } from 'firebase/firestore';
import { db } from './firebase';
import type { SimulationBlock } from '../store/useSimulationStore';
import type { FrequentRoute } from '../types';

export interface ShiftData {
    userId: string;
    date: Date;
    totalShiftMs: number;
    drivingMs: number;
    breakMs: number;
    restMs: number;
    workMs: number;
    complianceStatus: string;
}

export const shiftService = {
    // 1. Guardar turno finalizado
    async saveShift(userId: string, data: Omit<ShiftData, 'userId' | 'date'> & { date?: Date }) {
        if (!userId) throw new Error('Usuario no autenticado');

        const shiftDoc: ShiftData = {
            userId,
            date: data.date || new Date(),
            drivingMs: data.drivingMs,
            breakMs: data.breakMs,
            restMs: data.restMs,
            workMs: data.workMs,
            totalShiftMs: data.totalShiftMs,
            complianceStatus: data.complianceStatus
        };

        const shiftsRef = collection(db, 'shifts');
        await addDoc(shiftsRef, {
            ...shiftDoc,
            date: Timestamp.fromDate(shiftDoc.date) // Firebase type
        });
    },

    // 2. Obtener historial (Últimos N días)
    async getRecentShifts(userId: string, daysLimit: number = 15): Promise<ShiftData[]> {
        if (!userId) return [];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysLimit);

        const shiftsRef = collection(db, 'shifts');
        const q = query(
            shiftsRef,
            where('userId', '==', userId),
            where('date', '>=', Timestamp.fromDate(startDate)),
            orderBy('date', 'desc'),
            limit(50)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                date: data.date.toDate() // Convert Firebase Timestamp back to JS Date
            } as ShiftData;
        });
    },

    // 3. Calculador básico para "Autocompletar" en Simulador
    async getAverageDrivingMs(userId: string): Promise<number> {
        const shifts = await this.getRecentShifts(userId, 15);
        if (shifts.length === 0) return 4.5 * 60 * 60 * 1000; // Por defecto 4.5 horas

        const totalDriving = shifts.reduce((acc, shift) => acc + shift.drivingMs, 0);
        return totalDriving / shifts.length;
    },

    // 4. Guardar Ruta Frecuente (Constructor)
    async saveFrequentRoute(userId: string, routeName: string, blocks: SimulationBlock[]) {
        if (!userId) throw new Error('Usuario no autenticado');

        const userDocRef = doc(db, 'users', userId);
        const routesRef = collection(userDocRef, 'frequent_routes');
        await addDoc(routesRef, {
            routeName,
            blocks
        });
    },

    // 5. Obtener Rutas Frecuentes del Usuario
    async getFrequentRoutes(userId: string): Promise<FrequentRoute[]> {
        if (!userId) return [];

        const userDocRef = doc(db, 'users', userId);
        const routesRef = collection(userDocRef, 'frequent_routes');
        const q = query(routesRef); // Ya estamos en la colección del usuario

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            userId,
            routeName: docSnap.data().routeName,
            blocks: docSnap.data().blocks
        } as FrequentRoute));
    }
};
