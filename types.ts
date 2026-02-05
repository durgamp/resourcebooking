
export enum Team {
    CDS = 'CDS',
    MFG = 'Mfg',
    TECH_TRANSFER = 'Tech Transfer'
}

export enum BookingStatus {
    PROPOSED = 'Proposed',
    ACTUAL = 'Actual',
    CANCELLED = 'Cancelled'
}

export enum DowntimeType {
    MAINTENANCE = 'Maintenance',
    CLEANING = 'Cleaning',
    CALIBRATION = 'Calibration',
    BREAKDOWN = 'Breakdown'
}

export interface Reactor {
    serialNo: string;
    maxCapacityLiters: number;
    capacityRange: string; // e.g., "0-500L", "500-1000L"
    moc: string;
    agitatorType: string;
    plantName: string;
    blockName: string;
    commissionDate: string;
    notes?: string;
}

export interface Downtime {
    id: string;
    reactorSerialNo: string;
    startDateTime: Date;
    endDateTime: Date;
    type: DowntimeType;
    reason: string;
    updatedByEmail: string;
    updatedAt: Date;
    isCancelled: boolean;
}

export interface Booking {
    id: string;
    reactorSerialNo: string;
    team: Team;
    productName: string;
    stage: string;
    batchNumber: string;
    operation: string;
    startDateTime: Date;
    endDateTime: Date;
    status: BookingStatus;
    requestedByEmail: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OccupancyMetric {
    reactorSerialNo: string;
    month: string;
    availableHours: number;
    proposedHours: number;
    proposedPercent: number;
    actualHours: number;
    actualPercent: number;
    downtimeHours: number;
    blockName: string;
    plantName: string;
}

export type ViewType = 'CALENDAR' | 'DASHBOARD' | 'REACTORS' | 'DOWNTIME' | 'BOOKINGS';
