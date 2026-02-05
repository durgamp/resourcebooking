
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Calendar,
    LayoutDashboard,
    Settings,
    Database,
    PlusCircle,
    Wrench,
    Search,
    Bell,
    ChevronDown,
    Activity,
    ShieldCheck,
    X
} from 'lucide-react';
import { ViewType, Reactor, Booking, Downtime, BookingStatus } from './types';
import * as api from './services/api';
import { seedDatabase } from './services/seed';
import { CalendarView } from './components/CalendarView';
import { Dashboard } from './components/Dashboard';
import { BookingForm } from './components/BookingForm';
import { ReactorManagement } from './components/ReactorManagement';
import { DowntimeRegistry } from './components/DowntimeRegistry';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewType>('CALENDAR');
    const [reactors, setReactors] = useState<Reactor[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [downtimes, setDowntimes] = useState<Downtime[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedReactor, setSelectedReactor] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [fetchedReactors, fetchedBookings, fetchedDowntimes] = await Promise.all([
                    api.fetchReactors(),
                    api.fetchBookings(),
                    api.fetchDowntimes()
                ]);
                setReactors(fetchedReactors);
                setBookings(fetchedBookings);
                setDowntimes(fetchedDowntimes);
            } catch (error) {
                console.error("Failed to load data:", error);
                // Don't alert immediately on load to avoid spamming if config is wrong initially
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Filtered data based on global search
    const filteredReactors = useMemo(() =>
        reactors.filter(r =>
            r.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.blockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.plantName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [reactors, searchTerm]);

    const filteredBookings = useMemo(() =>
        bookings.filter(b =>
            b.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.reactorSerialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
        ), [bookings, searchTerm]);

    const handleAddBooking = useCallback((reactorId: string, date: Date) => {
        setSelectedReactor(reactorId);
        setSelectedDate(date);
        setShowBookingForm(true);
    }, []);

    const submitNewBooking = useCallback(async (newBooking: Booking) => {
        try {
            const savedBooking = await api.createBooking(newBooking);
            console.info(`[Audit] New Booking Committed: ${savedBooking.id} by ${savedBooking.requestedByEmail}`);
            setBookings(prev => [...prev, savedBooking]);
        } catch (error: any) {
            console.error("Failed to create booking:", error);
            alert("Failed to save booking to database: " + (error.message || JSON.stringify(error)));
        }
    }, []);

    const handleDeleteBooking = useCallback(async (id: string) => {
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;

        if (booking.status === BookingStatus.ACTUAL) {
            alert("Security Protocol: An 'Actual Work Log' cannot be deleted. Please contact the administrator for corrections.");
            return;
        }

        if (confirm("Are you sure you want to delete this 'Proposed Booking'?")) {
            try {
                await api.deleteBooking(id);
                setBookings(prev => prev.filter(b => b.id !== id));
            } catch (error) {
                console.error("Failed to delete booking:", error);
                alert("Failed to delete booking.");
            }
        }
    }, [bookings]);

    // Reactor CRUD Handlers
    const handleAddReactor = useCallback(async (newReactor: Reactor) => {
        try {
            if (reactors.some(r => r.serialNo === newReactor.serialNo)) {
                alert("Reactor with this serial number already exists.");
                return;
            }
            const savedReactor = await api.createReactor(newReactor);
            setReactors(prev => [...prev, savedReactor]);
        } catch (error) {
            console.error("Failed to create reactor:", error);
            alert("Failed to save reactor.");
        }
    }, [reactors]);

    const handleUpdateReactor = useCallback(async (updatedReactor: Reactor) => {
        try {
            const savedReactor = await api.updateReactor(updatedReactor);
            setReactors(prev => prev.map(r => r.serialNo === savedReactor.serialNo ? savedReactor : r));
        } catch (error) {
            console.error("Failed to update reactor:", error);
            alert("Failed to update reactor.");
        }
    }, []);

    const handleDeleteReactor = useCallback(async (serialNo: string) => {
        if (confirm("Are you sure you want to delete this reactor? This action cannot be undone.")) {
            try {
                await api.deleteReactor(serialNo);
                setReactors(prev => prev.filter(r => r.serialNo !== serialNo));
                setBookings(prev => prev.filter(b => b.reactorSerialNo !== serialNo));
                setDowntimes(prev => prev.filter(d => d.reactorSerialNo !== serialNo));
            } catch (error) {
                console.error("Failed to delete reactor:", error);
                alert("Failed to delete reactor.");
            }
        }
    }, []);

    // Downtime CRUD Handlers
    const handleAddDowntime = useCallback(async (newDowntime: Downtime) => {
        try {
            const savedDowntime = await api.createDowntime(newDowntime);
            setDowntimes(prev => [...prev, savedDowntime]);
        } catch (error) {
            console.error("Failed to create downtime:", error);
            alert("Failed to save downtime record.");
        }
    }, []);

    const handleUpdateDowntime = useCallback(async (updatedDowntime: Downtime) => {
        try {
            const savedDowntime = await api.updateDowntime(updatedDowntime);
            setDowntimes(prev => prev.map(d => d.id === savedDowntime.id ? savedDowntime : d));
        } catch (error) {
            console.error("Failed to update downtime:", error);
            alert("Failed to update downtime record.");
        }
    }, []);

    const handleCancelDowntime = useCallback(async (id: string) => {
        const downtime = downtimes.find(d => d.id === id);
        if (!downtime) return;
        try {
            const updated = { ...downtime, isCancelled: true };
            await api.updateDowntime(updated);
            setDowntimes(prev => prev.map(d => d.id === id ? updated : d));
        } catch (error) {
            console.error("Failed to cancel downtime:", error);
            alert("Failed to cancel downtime.");
        }
    }, [downtimes]);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-100">
            {/* Sidebar Navigation */}
            <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0">
                <div className="p-8 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <Activity className="text-white" size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white tracking-tighter leading-none">ReactoPlan</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Enterprise Scheduling</span>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-2 mt-4">
                    <NavItem
                        icon={<Calendar size={20} />}
                        label="Manufacturing Scheduler"
                        active={activeView === 'CALENDAR'}
                        onClick={() => setActiveView('CALENDAR')}
                    />
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Occupancy Dashboard"
                        active={activeView === 'DASHBOARD'}
                        onClick={() => setActiveView('DASHBOARD')}
                    />
                    <div className="pt-8 pb-4 px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Asset Management</div>
                    <NavItem
                        icon={<Database size={20} />}
                        label="Reactor Inventory"
                        active={activeView === 'REACTORS'}
                        onClick={() => setActiveView('REACTORS')}
                    />
                    <NavItem
                        icon={<Wrench size={20} />}
                        label="Downtime Registry"
                        active={activeView === 'DOWNTIME'}
                        onClick={() => setActiveView('DOWNTIME')}
                    />
                </nav>

                <div className="p-6">
                    <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-800">
                        <div className="flex items-center text-blue-400 mb-2">
                            <ShieldCheck size={14} className="mr-2" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Compliance Active</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                            All reactor bookings are subject to automatic overlap prevention and audit logging.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-full border-2 border-slate-700 p-0.5 bg-slate-800 overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya" className="w-full h-full object-cover" alt="Avatar" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">Aditya Sharma</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Plant Operations Dir.</span>
                        </div>
                    </div>
                    <ChevronDown size={14} className="text-slate-500 cursor-pointer" />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Header Bar */}
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-40 shadow-sm shadow-slate-100/50">
                    <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-2.5 w-[450px] border border-slate-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Search size={18} className="text-slate-400 mr-3" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Query reactor ID, products, or batch logs..."
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 font-medium"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={14} className="text-slate-400" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"
                            >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <Settings size={20} />
                            </button>
                        </div>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <button
                            onClick={() => {
                                setSelectedReactor(reactors[0]?.serialNo || '');
                                setSelectedDate(new Date());
                                setShowBookingForm(true);
                            }}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                        >
                            <PlusCircle size={18} />
                            <span>Create New Booking</span>
                        </button>
                    </div>
                </header>

                {/* Dynamic Viewport */}
                <div className="flex-1 overflow-auto p-10 custom-scrollbar bg-slate-50/50">
                    {activeView === 'CALENDAR' && (
                        <CalendarView
                            reactors={filteredReactors}
                            bookings={filteredBookings}
                            downtimes={downtimes}
                            onAddBooking={handleAddBooking}
                            onDeleteBooking={handleDeleteBooking}
                        />
                    )}

                    {activeView === 'DASHBOARD' && (
                        <Dashboard
                            reactors={filteredReactors}
                            bookings={filteredBookings}
                            downtimes={downtimes}
                        />
                    )}

                    {activeView === 'REACTORS' && (
                        <ReactorManagement
                            reactors={filteredReactors}
                            onAddReactor={handleAddReactor}
                            onUpdateReactor={handleUpdateReactor}
                            onDeleteReactor={handleDeleteReactor}
                        />
                    )}

                    {activeView === 'DOWNTIME' && (
                        <DowntimeRegistry
                            downtimes={downtimes}
                            reactors={filteredReactors}
                            bookings={filteredBookings}
                            onAddDowntime={handleAddDowntime}
                            onUpdateDowntime={handleUpdateDowntime}
                            onCancelDowntime={handleCancelDowntime}
                        />
                    )}
                </div>
            </main>

            {/* Modal Layers */}
            {showBookingForm && (
                <BookingForm
                    reactorSerialNo={selectedReactor}
                    initialDate={selectedDate}
                    onClose={() => setShowBookingForm(false)}
                    onSubmit={submitNewBooking}
                    reactors={reactors}
                    allBookings={bookings}
                    allDowntimes={downtimes}
                />
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">System Settings</h3>
                            <button onClick={() => setShowSettings(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">Configure global plant parameters and security protocols.</p>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-bold">Auto-Validation Mode</span>
                                <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto"></div></div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm font-bold">Gemini Insights Enhanced</span>
                                <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto"></div></div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Data Management</p>
                                <button
                                    onClick={async () => {
                                        if (confirm("This will insert default mock data into the database. Existing data with colliding IDs/Serial Numbers might cause errors or be skipped. Continue?")) {
                                            try {
                                                await seedDatabase();
                                                alert("Database seeded successfully! Please refresh the page.");
                                                window.location.reload();
                                            } catch (e: any) {
                                                console.error(e);
                                                alert("Failed to seed database: " + (e.message || JSON.stringify(e)));
                                            }
                                        }
                                    }}
                                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-colors flex items-center justify-center"
                                >
                                    <Database size={16} className="mr-2" />
                                    Seed Initial Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Popover */}
            {showNotifications && (
                <div className="fixed top-24 right-48 z-[50] w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in slide-in-from-top-4">
                    <div className="p-6 border-b border-slate-50">
                        <h4 className="font-bold">Recent Alerts</h4>
                    </div>
                    <div className="max-h-96 overflow-auto">
                        <div className="p-4 border-b border-slate-50 bg-blue-50/30">
                            <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">Schedule Conflict</div>
                            <div className="text-xs font-bold text-slate-800">Reactor R-101 maintenance overlap detected.</div>
                            <div className="text-[10px] text-slate-400 mt-1">2 mins ago</div>
                        </div>
                        <div className="p-4 border-b border-slate-50">
                            <div className="text-[10px] font-bold text-green-600 uppercase mb-1">System Update</div>
                            <div className="text-xs font-bold text-slate-800">Plant Alpha master data successfully synced.</div>
                            <div className="text-[10px] text-slate-400 mt-1">1 hour ago</div>
                        </div>
                    </div>
                    <div className="p-4 text-center">
                        <button className="text-xs font-bold text-blue-600">Mark all as read</button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${active
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 translate-x-1'
                : 'hover:bg-slate-800 text-slate-500 hover:text-slate-100'
            }`}
    >
        <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
        </span>
        <span className="text-xs font-bold tracking-tight">{label}</span>
    </button>
);

export default App;
