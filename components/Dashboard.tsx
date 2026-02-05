
import React from 'react';
import { Reactor, Booking, Downtime } from '../types';
import { calculateOccupancy } from '../utils';

interface DashboardProps {
    reactors: Reactor[];
    bookings: Booking[];
    downtimes: Downtime[];
}

export const Dashboard: React.FC<DashboardProps> = ({ reactors, bookings, downtimes }) => {
    const metrics = calculateOccupancy(new Date(), reactors, bookings, downtimes);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-slate-500 font-bold text-sm uppercase">Total Reactors</div>
                    <div className="text-3xl font-black text-slate-800 mt-2">{reactors.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-slate-500 font-bold text-sm uppercase">Active Bookings</div>
                    <div className="text-3xl font-black text-blue-600 mt-2">{bookings.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-slate-500 font-bold text-sm uppercase">Maintenance Events</div>
                    <div className="text-3xl font-black text-rose-500 mt-2">{downtimes.length}</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4">Occupancy Metrics</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="p-3 text-sm font-bold text-slate-500">Reactor</th>
                                <th className="p-3 text-sm font-bold text-slate-500">Available Hrs</th>
                                <th className="p-3 text-sm font-bold text-slate-500">Proposed Load</th>
                                <th className="p-3 text-sm font-bold text-slate-500">Actual Load</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.map(m => (
                                <tr key={m.reactorSerialNo} className="border-b border-slate-50">
                                    <td className="p-3 font-medium">{m.reactorSerialNo}</td>
                                    <td className="p-3 text-slate-600">{m.availableHours}h</td>
                                    <td className="p-3">
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 max-w-[100px]">
                                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, m.proposedPercent)}%` }}></div>
                                        </div>
                                        <span className="text-xs text-slate-400 mt-1">{m.proposedHours}h</span>
                                    </td>
                                    <td className="p-3">
                                        <div className="w-full bg-slate-100 rounded-full h-2.5 max-w-[100px]">
                                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, m.actualPercent)}%` }}></div>
                                        </div>
                                        <span className="text-xs text-slate-400 mt-1">{m.actualHours}h</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
