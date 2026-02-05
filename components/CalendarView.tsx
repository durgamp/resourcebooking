
import React from 'react';
import { Reactor, Booking, Downtime } from '../types';

interface CalendarViewProps {
    reactors: Reactor[];
    bookings: Booking[];
    downtimes: Downtime[];
    onAddBooking: (reactorId: string, date: Date) => void;
    onDeleteBooking: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    reactors,
    bookings,
    downtimes,
    onAddBooking,
    onDeleteBooking
}) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4">Manufacturing Schedule</h2>
            <div className="overflow-x-auto">
                {/* Placeholder for complex calendar grid - simplified for recovery */}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="p-3 font-bold text-slate-500 text-sm">Reactor</th>
                            <th className="p-3 font-bold text-slate-500 text-sm">Status</th>
                            <th className="p-3 font-bold text-slate-500 text-sm">Bookings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reactors.map(reactor => (
                            <tr key={reactor.serialNo} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-slate-800">
                                    <div>{reactor.serialNo}</div>
                                    <div className="text-xs text-slate-400 font-normal">{reactor.plantName}</div>
                                </td>
                                <td className="p-3">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Operational</span>
                                </td>
                                <td className="p-3">
                                    <div className="flex space-x-2 overflow-x-auto">
                                        {bookings.filter(b => b.reactorSerialNo === reactor.serialNo).map(b => (
                                            <div key={b.id} className="p-2 bg-blue-100 text-blue-800 rounded-lg text-xs min-w-[150px] cursor-pointer hover:bg-blue-200" onClick={() => onDeleteBooking(b.id)}>
                                                <div className="font-bold">{b.productName}</div>
                                                <div>{new Date(b.startDateTime).toLocaleDateString()}</div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => onAddBooking(reactor.serialNo, new Date())}
                                            className="p-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:text-blue-600 hover:border-blue-300"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
