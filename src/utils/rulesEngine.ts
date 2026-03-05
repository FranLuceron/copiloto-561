import type { ActivitySegment, ValidationResult, DailyStats } from '../types';

export const MAX_CONTINUOUS_DRIVE_MINUTES = 4 * 60 + 30; // 4h30
export const WARNING_THRESHOLD_MINUTES = 4 * 60; // 4h00

export const MAX_DAILY_DRIVE_STANDARD = 9 * 60; // 9h
export const MAX_DAILY_DRIVE_EXTENDED = 10 * 60; // 10h

export const MIN_DAILY_REST_STANDARD = 11 * 60; // 11h
export const MIN_DAILY_REST_REDUCED = 9 * 60; // 9h

export const calculateContinuousDrive = (activities: ActivitySegment[], currentTime: number): ValidationResult => {
    // Finds the last contiguous driving period without a valid 45min break
    let continuousDrive = 0;

    // Almacena si tenemos una pausa previa válida parcial (de al menos 30 minutos).
    // La normativa pide que sean 15+ minutos SEGUIDOS de 30+ minutos en ese orden,
    // pero iteramos hacia atrás: así que primero debemos encontrar una de 30, y luego buscar la de 15.
    let partialBreak = 0;

    for (let i = activities.length - 1; i >= 0; i--) {
        const act = activities[i];
        const duration = ((act.endTime || currentTime) - act.startTime) / 60000;

        if (act.type === 'DRIVE') {
            continuousDrive += duration;
        } else if (act.type === 'BREAK' || act.type === 'REST') {
            if (duration >= 45) {
                // Un descanso ininterrumpido de 45 mins o más reinicia todo.
                break;
            } else if (duration >= 30 && partialBreak === 0) {
                // Al ir hacia atrás (del presente al pasado), esta es la "última" pausa.
                // Debe ser el bloque de 30 minutos. Lo guardamos y seguimos iterando en busca de los 15 min.
                partialBreak = duration;
            } else if (duration >= 15 && partialBreak >= 30) {
                // Si ya teníamos una pausa parcial registrada > 30 (en el futuro relativo)
                // y ahora encontramos una anterior de > 15 (en el pasado relativo),
                // esto constituye una pausa fraccionada válida (15 min y luego 30 min).
                break;
            }
            // Otras pausas (ej. < 15, o < 30 sin una base previa, no resetean el contador)
        }
    }

    const remainingMinutes = MAX_CONTINUOUS_DRIVE_MINUTES - continuousDrive;

    if (remainingMinutes < 0) {
        return { status: 'VIOLATION', message: 'Excedidas las 4h30m de conducción continua', remainingMinutes: 0 };
    } else if (remainingMinutes <= 30) {
        return { status: 'WARNING', message: 'Advertencia: Próximo al límite de 4h30m', remainingMinutes };
    }

    return { status: 'OK', message: 'Conducción continua OK', remainingMinutes };
};

export const calculateDailyDrive = (stats: DailyStats): ValidationResult => {
    const limit = stats.isExtendedDriveUsed ? MAX_DAILY_DRIVE_EXTENDED : MAX_DAILY_DRIVE_STANDARD;
    const remainingMinutes = limit - stats.totalDriveMinutes;

    if (remainingMinutes < 0) {
        return { status: 'VIOLATION', message: `Excedido el límite diario de ${stats.isExtendedDriveUsed ? '10h' : '9h'}`, remainingMinutes: 0 };
    } else if (remainingMinutes <= 60) {
        return { status: 'WARNING', message: 'Advertencia: Próximo al límite de conducción diaria', remainingMinutes };
    }

    return { status: 'OK', message: 'Conducción diaria OK', remainingMinutes };
};
