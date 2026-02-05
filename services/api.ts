
import { supabase } from './supabase';
import { Reactor, Booking, Downtime, BookingStatus, DowntimeType } from '../types';

// Reactors
export const fetchReactors = async (): Promise<Reactor[]> => {
    const { data, error } = await supabase
        .from('reactors')
        .select('*');

    if (error) throw error;
    return data as Reactor[];
};

export const createReactor = async (reactor: Reactor): Promise<Reactor> => {
    const { data, error } = await supabase
        .from('reactors')
        .insert(reactor)
        .select()
        .single();

    if (error) throw error;
    return data as Reactor;
};

export const updateReactor = async (reactor: Reactor): Promise<Reactor> => {
    const { data, error } = await supabase
        .from('reactors')
        .update(reactor)
        .eq('serialNo', reactor.serialNo)
        .select()
        .single();

    if (error) throw error;
    return data as Reactor;
};

export const deleteReactor = async (serialNo: string): Promise<void> => {
    const { error } = await supabase
        .from('reactors')
        .delete()
        .eq('serialNo', serialNo);

    if (error) throw error;
};

// Bookings
export const fetchBookings = async (): Promise<Booking[]> => {
    const { data, error } = await supabase
        .from('bookings')
        .select('*');

    if (error) throw error;

    // Convert string dates back to Date objects
    return (data || []).map((b: any) => ({
        ...b,
        startDateTime: new Date(b.startDateTime),
        endDateTime: new Date(b.endDateTime),
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt)
    }));
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> => {
    const { data, error } = await supabase
        .from('bookings')
        .insert({
            ...booking,
            startDateTime: booking.startDateTime.toISOString(),
            endDateTime: booking.endDateTime.toISOString()
        })
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
    };
};

export const deleteBooking = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// Downtime
export const fetchDowntimes = async (): Promise<Downtime[]> => {
    const { data, error } = await supabase
        .from('downtime')
        .select('*');

    if (error) throw error;

    return (data || []).map((d: any) => ({
        ...d,
        startDateTime: new Date(d.startDateTime),
        endDateTime: new Date(d.endDateTime),
        updatedAt: new Date(d.updatedAt)
    }));
};

export const createDowntime = async (downtime: Omit<Downtime, 'id' | 'updatedAt'>): Promise<Downtime> => {
    const { data, error } = await supabase
        .from('downtime')
        .insert({
            ...downtime,
            startDateTime: downtime.startDateTime.toISOString(),
            endDateTime: downtime.endDateTime.toISOString()
        })
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        updatedAt: new Date(data.updatedAt)
    };
};

export const updateDowntime = async (downtime: Downtime): Promise<Downtime> => {
    const { data, error } = await supabase
        .from('downtime')
        .update({
            ...downtime,
            startDateTime: downtime.startDateTime.toISOString(),
            endDateTime: downtime.endDateTime.toISOString()
        })
        .eq('id', downtime.id)
        .select()
        .single();

    if (error) throw error;

    return {
        ...data,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        updatedAt: new Date(data.updatedAt)
    };
};
