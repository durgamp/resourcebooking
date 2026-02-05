
import React from 'react';
import { Downtime, Reactor, Booking } from '../types';

interface DowntimeRegistryProps {
    downtimes: Downtime[];
    reactors: Reactor[];
    bookings: Booking[];
    onAddDowntime: (dt: Downtime) => void;
    onUpdateDowntime: (dt: Downtime) => void;
    onCancelDowntime: (id: string) => void;
}

export const DowntimeRegistry: React.FC<DowntimeRegistryProps> = ({ downtimes, onCancelDowntime }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4">Downtime Registry</h2>
            <div className="space-y-4">
                {downtimes.map(dt => (
                    <div key={dt.id} className={`p-4 rounded-xl border ${dt.isCancelled ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-rose-50 border-rose-100'}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-bold text-rose-800 flex items-center">
                                    {dt.reactorSerialNo} - {dt.type}
                                    {dt.isCancelled && <span className="ml-2 text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">CANCELLED</span>}
                                </div>
                                <div className="text-sm text-rose-600 mt-1">{dt.reason}</div>
                            </div>
                            {!dt.isCancelled && (
                                <button onClick={() => onCancelDowntime(dt.id)} className="text-xs font-bold text-rose-600 hover:bg-rose-100 px-3 py-1.5 rounded-lg">
                                    Cancel Maintenance
                                </button>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-rose-400">
                            {new Date(dt.startDateTime).toLocaleString()} - {new Date(dt.endDateTime).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
