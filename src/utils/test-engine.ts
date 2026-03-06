import { calculateContinuousDrive, calculateDailyDrive } from './rulesEngine';
import type { ActivitySegment, DailyStats } from '../types';
import type { SimulationOffset } from '../store/useSimulationStore';

const computeShiftState = (activities: ActivitySegment[], stats: DailyStats, currentTime: number, offset?: SimulationOffset) => {
    const continuousResult = calculateContinuousDrive(activities, currentTime, offset);

    if (continuousResult.status === 'VIOLATION') return { status: 'red', code: 'BREAK_DUE' };
    if (continuousResult.status === 'WARNING') return { status: 'amber', reason: 'Warning threshold' };

    const dailyResult = calculateDailyDrive(stats, offset);
    if (dailyResult.status === 'VIOLATION') return { status: 'red', code: 'DAILY_DRIVE_LIMIT' };

    return { status: 'green', reset: continuousResult.message.includes('OK') ? true : false };
};

const runTests = () => {
    console.log("=== INICIANDO QA: MOTOR DE REGLAS 561/2006 (CON OFFSETS) ===\n");

    const baseTime = new Date('2026-03-04T08:00:00Z').getTime();

    const createAct = (type: 'DRIVE' | 'BREAK' | 'REST' | 'WORK', minutesDelayStart: number, durationMinutes: number): ActivitySegment => ({
        id: Math.random().toString(),
        type,
        startTime: baseTime + (minutesDelayStart * 60000),
        endTime: baseTime + ((minutesDelayStart + durationMinutes) * 60000)
    });

    const cases = [
        {
            id: 'Caso 01: Vainilla',
            desc: '0h conduciendo -> Acción: Conducir 2h.',
            expected: { status: 'green' },
            activities: [createAct('DRIVE', 0, 120)],
            stats: { totalDriveMinutes: 120, totalBreakMinutes: 0, totalRestMinutes: 0, totalWorkMinutes: 0, continuousDriveMinutes: 120, isExtendedDriveUsed: false, startDate: baseTime },
            currentTime: baseTime + (120 * 60000),
            offset: { drivingTimeToday: 0, lastRestType: '11H' as const, hasTakenBreak: false }
        },
        {
            id: 'Caso 02: Offset Interviene',
            desc: 'OFFSET 3h previas. Simulo Conducir 2h (Total 5h > 4.5h).',
            expected: { status: 'red', code: 'BREAK_DUE' },
            activities: [createAct('DRIVE', 0, 120)],
            stats: { totalDriveMinutes: 120, totalBreakMinutes: 0, totalRestMinutes: 0, totalWorkMinutes: 0, continuousDriveMinutes: 120, isExtendedDriveUsed: false, startDate: baseTime },
            currentTime: baseTime + (120 * 60000),
            offset: { drivingTimeToday: 180, lastRestType: '11H' as const, hasTakenBreak: false }
        },
        {
            id: 'Caso 03: Offset mitigado por break',
            desc: 'OFFSET 3h previas. Simulo Pausa 45m + Conducir 2h.',
            expected: { status: 'green' },
            activities: [createAct('BREAK', 0, 45), createAct('DRIVE', 45, 120)],
            stats: { totalDriveMinutes: 120, totalBreakMinutes: 45, totalRestMinutes: 0, totalWorkMinutes: 0, continuousDriveMinutes: 120, isExtendedDriveUsed: false, startDate: baseTime },
            currentTime: baseTime + (165 * 60000),
            offset: { drivingTimeToday: 180, lastRestType: '11H' as const, hasTakenBreak: false }
        },
        {
            id: 'Caso 04: Offset Daily Drive',
            desc: 'OFFSET 8h previas. Simulo Conducir 1h30m (Total 9.5h > 9h).',
            expected: { status: 'red', code: 'DAILY_DRIVE_LIMIT' },
            activities: [createAct('DRIVE', 0, 90)],
            stats: { totalDriveMinutes: 90, totalBreakMinutes: 0, totalRestMinutes: 0, totalWorkMinutes: 0, continuousDriveMinutes: 90, isExtendedDriveUsed: false, startDate: baseTime },
            currentTime: baseTime + (90 * 60000),
            offset: { drivingTimeToday: 480, lastRestType: '11H' as const, hasTakenBreak: true } // Ya ha tomado break previo
        }
    ];

    let allPass = true;
    cases.forEach((c) => {
        const result = computeShiftState(c.activities, c.stats, c.currentTime, c.offset);
        const passedStatus = result.status === c.expected.status;
        const passedCode = (c.expected as any).code ? result.code === (c.expected as any).code : true;
        const passed = passedStatus && passedCode;
        if (!passed) allPass = false;

        console.log(`[${c.id}] | ${c.desc}`);
        console.log(`  Esperado :`, c.expected);
        console.log(`  Obtenido :`, result);
        console.log(`  Compliance: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
    });

    if (allPass) {
        console.log('✅ TEST SUITE DONE: PERFECT SCORE!');
    } else {
        console.log('❌ TEST SUITE FAILED!');
    }
};

runTests();
