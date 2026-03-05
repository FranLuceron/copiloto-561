import { calculateContinuousDrive, calculateDailyDrive } from './rulesEngine';
import type { ActivitySegment, DailyStats } from '../types';

// Simulamos la nueva firma que pide el usuario pero envolviendo nuestras funciones existentes
// para no alterar directamente el motor antes de saber qué falla.
const computeShiftState = (activities: ActivitySegment[], stats: DailyStats, currentTime: number) => {
    const continuousResult = calculateContinuousDrive(activities, currentTime);

    // Mapeo básico de nuestra interfaz a la esperada por los tests (green, amber, red)
    if (continuousResult.status === 'VIOLATION') return { status: 'red', code: 'BREAK_DUE' };
    if (continuousResult.status === 'WARNING') return { status: 'amber', reason: 'Warning threshold' };

    const dailyResult = calculateDailyDrive(stats);
    if (dailyResult.status === 'VIOLATION') return { status: 'red', code: 'DAILY_DRIVE_LIMIT' };

    return { status: 'green', reset: continuousResult.message.includes('OK') ? true : false };
};

const runTests = () => {
    console.log("=== INICIANDO QA: MOTOR DE REGLAS 561/2006 ===\n");

    const baseTime = new Date('2026-03-04T08:00:00Z').getTime();

    // Función auxiliar para crear segmentos
    const createAct = (type: 'DRIVE' | 'BREAK' | 'REST' | 'WORK', minutesDelayStart: number, durationMinutes: number): ActivitySegment => ({
        id: Math.random().toString(),
        type,
        startTime: baseTime + (minutesDelayStart * 60000),
        endTime: baseTime + ((minutesDelayStart + durationMinutes) * 60000)
    });

    const cases = [
        {
            id: 'Caso 01',
            desc: '0h conduciendo -> Acción: Conducir 2h.',
            expected: { status: 'green' },
            activities: [
                createAct('DRIVE', 0, 120) // 2h de conducción
            ],
            stats: { totalDriveMinutes: 120, totalBreakMinutes: 0, totalRestMinutes: 0, totalWorkMinutes: 0, continuousDriveMinutes: 120, isExtendedDriveUsed: false, startDate: baseTime },
            currentTime: baseTime + (120 * 60000)
        },
        {
            id: 'Caso 02',
            desc: '4h25 conduciendo -> Acción: Conducir 10 min.',
            expected: { status: 'red', code: 'BREAK_DUE' },
            activities: [
                createAct('DRIVE', 0, 265), // 4h25
                createAct('DRIVE', 265, 10), // + 10 min = 4h35 (Excede 4h30)
            ],
            stats: { totalDriveMinutes: 275, totalBreakMinutes: 0, totalRestMinutes: 0, totalWorkMinutes: 0, continuousDriveMinutes: 275, isExtendedDriveUsed: false, startDate: baseTime },
            currentTime: baseTime + (275 * 60000)
        },
        {
            id: 'Caso 03',
            desc: '4h conduciendo -> Acción: Pausa 30\' + 15\'. (Orden Invalido)',
            expected: { status: 'amber', reason: 'Invalid order' },
            activities: [
                createAct('DRIVE', 0, 120),
                createAct('BREAK', 120, 30), // Pausa 30
                createAct('DRIVE', 150, 120),
                createAct('BREAK', 270, 15) // Pausa 15 (Debería ser 15 y luego 30. Esto es invalido y no resetea)
            ],
            stats: { totalDriveMinutes: 240, totalBreakMinutes: 45, totalRestMinutes: 0, totalWorkMinutes: 0, continuousDriveMinutes: 240, isExtendedDriveUsed: false, startDate: baseTime },
            currentTime: baseTime + (285 * 60000)
        },
        {
            id: 'Caso 04',
            desc: '4h conduciendo -> Acción: Pausa 15\' + 30\'. (Orden Válido)',
            expected: { status: 'green', reset: true },
            activities: [
                createAct('DRIVE', 0, 120),
                createAct('BREAK', 120, 15), // Pausa 15
                createAct('DRIVE', 135, 120),
                createAct('BREAK', 255, 30) // Pausa 30 (Válido, resetea conducción continua)
            ],
            stats: { totalDriveMinutes: 240, totalBreakMinutes: 45, totalRestMinutes: 0, totalWorkMinutes: 0, continuousDriveMinutes: 0, isExtendedDriveUsed: false, startDate: baseTime },
            currentTime: baseTime + (285 * 60000)
        },
        {
            id: 'Caso 05',
            desc: '8h45 conduciendo hoy -> Acción: Conducir 20 min.',
            expected: { status: 'red', code: 'DAILY_DRIVE_LIMIT' },
            activities: [
                // Simulamos periodos que suman 8h45
                createAct('DRIVE', 0, 265),
                createAct('BREAK', 265, 45),
                createAct('DRIVE', 310, 260), // 8h45 total (525 min)
                createAct('BREAK', 570, 45),
                createAct('DRIVE', 615, 20) // + 20 min = 9h05 (Excede las 9h standard)
            ],
            stats: { totalDriveMinutes: 545, totalBreakMinutes: 90, totalRestMinutes: 0, totalWorkMinutes: 0, continuousDriveMinutes: 20, isExtendedDriveUsed: false, startDate: baseTime },
            currentTime: baseTime + (635 * 60000)
        }
    ];

    cases.forEach((c) => {
        const result = computeShiftState(c.activities, c.stats, c.currentTime);
        const passedStatus = result.status === c.expected.status;
        const passedCode = (c.expected as any).code ? result.code === (c.expected as any).code : true;
        const passed = passedStatus && passedCode;

        console.log(`[${c.id}] | ${c.desc}`);
        console.log(`  Esperado :`, c.expected);
        console.log(`  Obtenido :`, result);
        console.log(`  Compliance: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
    });
};

runTests();
