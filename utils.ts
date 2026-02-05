
import { Reactor, Booking, Downtime, BookingStatus, DowntimeType } from './types';
import { addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, format, isWithinInterval, areIntervalsOverlapping, differenceInHours, isBefore, isAfter, isEqual } from 'date-fns';

/**
 * Checks for time overlaps with existing bookings and maintenance.
 * Also validates date sequence integrity.
 */
export const checkConflict = (
    reactorSerialNo: string,
    start: Date,
    end: Date,
    allBookings: Booking[],
    allDowntimes: Downtime[],
    excludeId?: string
) => {
    if (isBefore(end, start) || isEqual(end, start)) {
        return "End time must be after start time.";
    }

    const range = { start, end };

    // 1. Check Booking Conflicts
    const bookingConflict = allBookings.find(b =>
        b.reactorSerialNo === reactorSerialNo &&
        b.id !== excludeId &&
        b.status !== BookingStatus.CANCELLED &&
        areIntervalsOverlapping(range, { start: b.startDateTime, end: b.endDateTime })
    );

    if (bookingConflict) {
        return `Conflict: Reactor already booked for ${bookingConflict.productName} (${format(bookingConflict.startDateTime, 'HH:mm')} - ${format(bookingConflict.endDateTime, 'HH:mm')})`;
    }

    // 2. Check Downtime Conflicts
    const downtimeConflict = allDowntimes.find(d =>
        d.reactorSerialNo === reactorSerialNo &&
        d.id !== excludeId &&
        !d.isCancelled &&
        areIntervalsOverlapping(range, { start: d.startDateTime, end: d.endDateTime })
    );

    if (downtimeConflict) {
        return `Conflict: Reactor unavailable due to ${downtimeConflict.type} maintenance.`;
    }

    return null;
};

export const calculateOccupancy = (month: Date, allReactors: Reactor[], allBookings: Booking[], allDowntimes: Downtime[]) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const totalMonthHours = Math.max(0, differenceInHours(end, start));

    return allReactors.map(reactor => {
        const reactorDowntimes = allDowntimes.filter(d =>
            d.reactorSerialNo === reactor.serialNo && !d.isCancelled &&
            areIntervalsOverlapping({ start, end }, { start: d.startDateTime, end: d.endDateTime })
        );

        const downtimeHours = reactorDowntimes.reduce((acc, d) => {
            const dStart = isBefore(d.startDateTime, start) ? start : d.startDateTime;
            const dEnd = isAfter(d.endDateTime, end) ? end : d.endDateTime;
            return acc + Math.max(0, differenceInHours(dEnd, dStart));
        }, 0);

        const availableHours = Math.max(0, totalMonthHours - downtimeHours);

        const proposedHours = allBookings.filter(b =>
            b.reactorSerialNo === reactor.serialNo && b.status === BookingStatus.PROPOSED &&
            areIntervalsOverlapping({ start, end }, { start: b.startDateTime, end: b.endDateTime })
        ).reduce((acc, b) => {
            const bStart = isBefore(b.startDateTime, start) ? start : b.startDateTime;
            const bEnd = isAfter(b.endDateTime, end) ? end : b.endDateTime;
            return acc + Math.max(0, differenceInHours(bEnd, bStart));
        }, 0);

        const actualHours = allBookings.filter(b =>
            b.reactorSerialNo === reactor.serialNo && b.status === BookingStatus.ACTUAL &&
            areIntervalsOverlapping({ start, end }, { start: b.startDateTime, end: b.endDateTime })
        ).reduce((acc, b) => {
            const bStart = isBefore(b.startDateTime, start) ? start : b.startDateTime;
            const bEnd = isAfter(b.endDateTime, end) ? end : b.endDateTime;
            return acc + Math.max(0, differenceInHours(bEnd, bStart));
        }, 0);

        return {
            reactorSerialNo: reactor.serialNo,
            month: format(month, 'MMM yyyy'),
            availableHours,
            proposedHours,
            actualHours,
            downtimeHours,
            proposedPercent: availableHours > 0 ? (proposedHours / availableHours) * 100 : 0,
            actualPercent: availableHours > 0 ? (actualHours / availableHours) * 100 : 0,
            blockName: reactor.blockName,
            plantName: reactor.plantName
        };
    });
};
