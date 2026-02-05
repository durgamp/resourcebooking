
import { supabase } from './supabase';
import { Reactor, Booking, Downtime, Team, BookingStatus, DowntimeType } from '../types';
import { addDays, subDays } from 'date-fns';

const today = new Date();

export const seedReactors: Reactor[] = [
    { serialNo: 'R-101', maxCapacityLiters: 1000, capacityRange: '500-1000L', moc: 'SS316', agitatorType: 'Anchor', plantName: 'Plant Alpha', blockName: 'Block A', commissionDate: '2022-01-15' },
    { serialNo: 'R-102', maxCapacityLiters: 500, capacityRange: '0-500L', moc: 'Glass Lined', agitatorType: 'Propeller', plantName: 'Plant Alpha', blockName: 'Block A', commissionDate: '2022-03-10' },
    { serialNo: 'R-103', maxCapacityLiters: 2000, capacityRange: '1000L+', moc: 'SS316L', agitatorType: 'Turbine', plantName: 'Plant Alpha', blockName: 'Block B', commissionDate: '2021-11-20' },
    { serialNo: 'R-104', maxCapacityLiters: 1500, capacityRange: '1000L+', moc: 'Hastelloy', agitatorType: 'Magnetic', plantName: 'Plant Alpha', blockName: 'Block B', commissionDate: '2023-05-05' },
    { serialNo: 'R-201', maxCapacityLiters: 1000, capacityRange: '500-1000L', moc: 'SS316', agitatorType: 'Anchor', plantName: 'Plant Beta', blockName: 'Block C', commissionDate: '2022-01-15' },
    { serialNo: 'R-202', maxCapacityLiters: 2500, capacityRange: '1000L+', moc: 'Glass Lined', agitatorType: 'Rushton', plantName: 'Plant Beta', blockName: 'Block C', commissionDate: '2020-08-12' },
];

export const seedBookings = [
    {
        reactorSerialNo: 'R-101',
        team: Team.CDS,
        productName: 'Paracetamol',
        stage: 'Intermediate',
        batchNumber: 'BT-001',
        operation: 'Reflux',
        startDateTime: subDays(today, 2).toISOString(),
        endDateTime: addDays(today, 1).toISOString(),
        status: BookingStatus.ACTUAL,
        requestedByEmail: 'john.doe@facility.com'
    },
    {
        reactorSerialNo: 'R-101',
        team: Team.MFG,
        productName: 'Ibuprofen',
        stage: 'Final',
        batchNumber: 'BT-105',
        operation: 'Crystallization',
        startDateTime: addDays(today, 3).toISOString(),
        endDateTime: addDays(today, 6).toISOString(),
        status: BookingStatus.PROPOSED,
        requestedByEmail: 'sarah.m@facility.com'
    }
];

export const seedDowntimes = [
    {
        reactorSerialNo: 'R-102',
        startDateTime: subDays(today, 1).toISOString(),
        endDateTime: addDays(today, 1).toISOString(),
        type: DowntimeType.MAINTENANCE,
        reason: 'Annual calibration of sensors',
        updatedByEmail: 'maint@facility.com',
        isCancelled: false
    }
];

export const seedDatabase = async () => {
    console.log("Starting seed...");

    // Insert Reactors
    const { error: rError } = await supabase.from('reactors').upsert(seedReactors);
    if (rError) {
        console.error("Error seeding reactors:", rError);
        throw rError;
    }

    // Insert Bookings
    const { error: bError } = await supabase.from('bookings').insert(seedBookings);
    if (bError) {
        console.error("Error seeding bookings:", bError);
        throw bError;
    }

    // Insert Downtime
    const { error: dError } = await supabase.from('downtime').insert(seedDowntimes);
    if (dError) {
        console.error("Error seeding downtime:", dError);
        throw dError;
    }

    console.log("Database seeded successfully!");
};
