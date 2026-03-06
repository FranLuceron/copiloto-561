export type ActivityType = 'DRIVE' | 'BREAK' | 'WORK' | 'REST';

export interface ActivitySegment {
    id: string;
    type: ActivityType;
    startTime: number; // timestamp
    endTime: number | null; // null if currently active
    expectedDurationMins?: number; // Para temporizadores pautados inversos
}

export type ComplianceStatus = 'OK' | 'WARNING' | 'VIOLATION';

export interface ValidationResult {
    status: ComplianceStatus;
    message: string;
    remainingMinutes?: number;
}

export interface DailyStats {
    totalDriveMinutes: number;
    totalBreakMinutes: number;
    totalRestMinutes: number;
    totalWorkMinutes: number;
    continuousDriveMinutes: number;
    isExtendedDriveUsed: boolean; // 10h instead of 9h
    startDate: number; // start of the daily shift
}

export interface FrequentRoute {
    id: string; // Document ID from Firestore
    userId: string;
    routeName: string;
    blocks: any[]; // We will type it properly as SimulationBlock when used
}
