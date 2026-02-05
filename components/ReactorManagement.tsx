
import React from 'react';
import { Reactor } from '../types';

interface ReactorManagementProps {
    reactors: Reactor[];
    onAddReactor: (reactor: Reactor) => void;
    onUpdateReactor: (reactor: Reactor) => void;
    onDeleteReactor: (serialNo: string) => void;
}

export const ReactorManagement: React.FC<ReactorManagementProps> = ({ reactors, onDeleteReactor }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4">Reactor Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reactors.map(r => (
                    <div key={r.serialNo} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-lg">{r.serialNo}</div>
                                <div className="text-sm text-slate-500">{r.plantName} - {r.blockName}</div>
                            </div>
                            <button onClick={() => onDeleteReactor(r.serialNo)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">Delete</button>
                        </div>
                        <div className="mt-4 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Capacity</span>
                                <span className="font-medium">{r.maxCapacityLiters}L</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">MOC</span>
                                <span className="font-medium">{r.moc}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
