
import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { Brain, TrendingUp, CheckCircle, Clock, Search, ChevronRight, X, Download, FileText, Filter, Calendar } from 'lucide-react';
import { OccupancyMetric, Reactor, Booking, Downtime } from '../types';
import { calculateOccupancy } from '../mockData';
import { getSmartInsights } from '../services/geminiService';

interface DashboardProps {
  reactors: Reactor[];
  bookings: Booking[];
  downtimes: Downtime[];
}

export const Dashboard: React.FC<DashboardProps> = ({ reactors, bookings, downtimes }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Filter states
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedPlant, setSelectedPlant] = useState<string>('All');
  const [selectedBlock, setSelectedBlock] = useState<string>('All');
  const [selectedReactor, setSelectedReactor] = useState<string>('All');

  const [aiInsight, setAiInsight] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  // Generate year options (last 5 years)
  const yearOptions = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => currentYear - i),
    [currentYear]);

  // Generate month options
  const monthOptions = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];

  // Get unique plants and blocks
  const plantOptions = useMemo(() =>
    ['All', ...new Set(reactors.map(r => r.plantName))],
    [reactors]);

  const blockOptions = useMemo(() => {
    const filtered = selectedPlant === 'All'
      ? reactors
      : reactors.filter(r => r.plantName === selectedPlant);
    return ['All', ...new Set(filtered.map(r => r.blockName))];
  }, [reactors, selectedPlant]);

  const reactorOptions = useMemo(() => {
    let filtered = reactors;
    if (selectedPlant !== 'All') {
      filtered = filtered.filter(r => r.plantName === selectedPlant);
    }
    if (selectedBlock !== 'All') {
      filtered = filtered.filter(r => r.blockName === selectedBlock);
    }
    return ['All', ...filtered.map(r => r.serialNo)];
  }, [reactors, selectedPlant, selectedBlock]);

  // Reset dependent filters when parent changes
  useEffect(() => {
    setSelectedBlock('All');
    setSelectedReactor('All');
  }, [selectedPlant]);

  useEffect(() => {
    setSelectedReactor('All');
  }, [selectedBlock]);

  // Build selected date from year and month
  const selectedDate = useMemo(() =>
    new Date(selectedYear, selectedMonth, 1),
    [selectedYear, selectedMonth]);

  // Calculate metrics for selected date
  const allMetrics = useMemo(() =>
    calculateOccupancy(selectedDate, reactors, bookings, downtimes),
    [selectedDate, reactors, bookings, downtimes]
  );

  // Apply reactor filters
  const metrics = useMemo(() => {
    let filtered = allMetrics;
    if (selectedPlant !== 'All') {
      filtered = filtered.filter(m => m.plantName === selectedPlant);
    }
    if (selectedBlock !== 'All') {
      filtered = filtered.filter(m => m.blockName === selectedBlock);
    }
    if (selectedReactor !== 'All') {
      filtered = filtered.filter(m => m.reactorSerialNo === selectedReactor);
    }
    return filtered;
  }, [allMetrics, selectedPlant, selectedBlock, selectedReactor]);

  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      setIsAiLoading(true);
      try {
        const insight = await getSmartInsights(metrics);
        if (isMounted) setAiInsight(insight);
      } catch (err) {
        if (isMounted) setAiInsight("Error generating intelligent insights.");
      } finally {
        if (isMounted) setIsAiLoading(false);
      }
    };
    fetchInsights();
    return () => { isMounted = false; };
  }, [metrics]);

  const blockData = useMemo(() => {
    const grouped = metrics.reduce((acc, curr) => {
      if (!acc[curr.blockName]) {
        acc[curr.blockName] = { name: curr.blockName, proposed: 0, actual: 0, count: 0 };
      }
      acc[curr.blockName].proposed += curr.proposedPercent;
      acc[curr.blockName].actual += curr.actualPercent;
      acc[curr.blockName].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).map((g: any) => ({
      name: g.name,
      Proposed: Math.round(g.proposed / g.count),
      Actual: Math.round(g.actual / g.count)
    }));
  }, [metrics]);

  const plantAverages = useMemo(() => {
    if (metrics.length === 0) return { proposed: 0, actual: 0 };
    const p = metrics.reduce((a, b) => a + b.proposedPercent, 0) / metrics.length;
    const ac = metrics.reduce((a, b) => a + b.actualPercent, 0) / metrics.length;
    return { proposed: Math.round(p), actual: Math.round(ac) };
  }, [metrics]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Global Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">Filters</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Year Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="rounded-xl border-slate-200 bg-slate-50 py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all min-w-[100px]"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Month</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="rounded-xl border-slate-200 bg-slate-50 py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all min-w-[130px]"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          <div className="h-10 w-px bg-slate-200 mx-2"></div>

          {/* Plant Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plant</label>
            <select
              value={selectedPlant}
              onChange={e => setSelectedPlant(e.target.value)}
              className="rounded-xl border-slate-200 bg-slate-50 py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all min-w-[140px]"
            >
              {plantOptions.map(plant => (
                <option key={plant} value={plant}>{plant}</option>
              ))}
            </select>
          </div>

          {/* Block Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Block</label>
            <select
              value={selectedBlock}
              onChange={e => setSelectedBlock(e.target.value)}
              className="rounded-xl border-slate-200 bg-slate-50 py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all min-w-[120px]"
            >
              {blockOptions.map(block => (
                <option key={block} value={block}>{block}</option>
              ))}
            </select>
          </div>

          {/* Reactor Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reactor</label>
            <select
              value={selectedReactor}
              onChange={e => setSelectedReactor(e.target.value)}
              className="rounded-xl border-slate-200 bg-slate-50 py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all min-w-[100px]"
            >
              {reactorOptions.map(reactor => (
                <option key={reactor} value={reactor}>{reactor}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto">
            <button
              onClick={() => {
                setSelectedYear(currentYear);
                setSelectedMonth(currentMonth);
                setSelectedPlant('All');
                setSelectedBlock('All');
                setSelectedReactor('All');
              }}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Avg. Actual Occupancy"
          value={`${plantAverages.actual}%`}
          subtitle="Target: 85%"
          icon={<TrendingUp className="text-blue-500" />}
          color="blue"
        />
        <StatCard
          title="Avg. Proposed Bookings"
          value={`${plantAverages.proposed}%`}
          subtitle="Resource Forward Loading"
          icon={<CheckCircle className="text-amber-500" />}
          color="amber"
        />
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-xl shadow-indigo-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Brain size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-300">
              <Brain size={20} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Gemini Operations Analyst</span>
            </div>
            <div className="min-h-[60px]">
              {isAiLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700/50 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-700/50 rounded w-1/2 animate-pulse"></div>
                </div>
              ) : (
                <p className="text-slate-100 text-sm italic leading-relaxed whitespace-pre-line font-medium">
                  {aiInsight}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Productivity Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Operational Density by Block</h3>
            <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-tighter">
              <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span> Actual</div>
              <div className="flex items-center"><span className="w-3 h-3 bg-amber-400 rounded-full mr-2"></span> Proposed</div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis unit="%" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="Proposed" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Actual" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Reactors Table */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Resource Efficiency Index</h3>
            <button
              onClick={() => setShowReport(true)}
              className="text-sm font-bold text-blue-600 flex items-center hover:underline"
            >
              Full Report <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar pr-2">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-left text-slate-400 border-b border-slate-50 uppercase tracking-tighter text-[10px]">
                  <th className="pb-4 font-bold">Reactor Unit</th>
                  <th className="pb-4 font-bold">Manufacturing Block</th>
                  <th className="pb-4 font-bold text-right">Actual Utilization</th>
                  <th className="pb-4 font-bold text-right">Maint. Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {metrics.sort((a, b) => b.actualPercent - a.actualPercent).map(m => (
                  <tr key={m.reactorSerialNo} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-slate-800">{m.reactorSerialNo}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Monthly Active</div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500">{m.blockName}</span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.actualPercent}%` }}></div>
                        </div>
                        <span className="font-bold text-blue-600 tabular-nums">{m.actualPercent.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-right font-medium text-slate-400 tabular-nums">
                      {m.downtimeHours}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-8 bg-slate-50 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <FileText size={24} className="mr-3 text-blue-600" />
                  Full Efficiency Report
                </h2>
                <p className="text-slate-500 text-sm mt-1">Detailed breakdown for current month</p>
              </div>
              <button onClick={() => setShowReport(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400" aria-label="Close modal">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-slate-400 border-b-2 border-slate-100 uppercase tracking-tighter text-[10px]">
                    <th className="pb-4 font-bold">Reactor</th>
                    <th className="pb-4 font-bold">Plant</th>
                    <th className="pb-4 font-bold">Block</th>
                    <th className="pb-4 font-bold text-right">Available</th>
                    <th className="pb-4 font-bold text-right">Proposed</th>
                    <th className="pb-4 font-bold text-right">Actual</th>
                    <th className="pb-4 font-bold text-right">Downtime</th>
                    <th className="pb-4 font-bold text-right">Actual %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {metrics.map(m => (
                    <tr key={m.reactorSerialNo} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-bold text-slate-800">{m.reactorSerialNo}</td>
                      <td className="py-4 text-slate-600">{m.plantName}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500">{m.blockName}</span>
                      </td>
                      <td className="py-4 text-right font-medium text-slate-600 tabular-nums">{m.availableHours}h</td>
                      <td className="py-4 text-right font-medium text-amber-600 tabular-nums">{m.proposedHours}h</td>
                      <td className="py-4 text-right font-medium text-blue-600 tabular-nums">{m.actualHours}h</td>
                      <td className="py-4 text-right font-medium text-rose-500 tabular-nums">{m.downtimeHours}h</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(m.actualPercent, 100)}%` }}></div>
                          </div>
                          <span className="font-bold text-blue-600 tabular-nums">{m.actualPercent.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center space-x-4">
              <button onClick={() => setShowReport(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                Close
              </button>
              <button
                onClick={() => {
                  const csvContent = "Reactor,Plant,Block,Available Hours,Proposed Hours,Actual Hours,Downtime Hours,Actual %\n" +
                    metrics.map(m => `${m.reactorSerialNo},${m.plantName},${m.blockName},${m.availableHours},${m.proposedHours},${m.actualHours},${m.downtimeHours},${m.actualPercent.toFixed(1)}`).join("\n");
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `efficiency_report_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center"
              >
                <Download size={16} className="mr-2" /> Export CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, subtitle: string, icon: React.ReactNode, color: string }> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses: any = {
    blue: "bg-blue-500",
    amber: "bg-amber-500",
  };
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</span>
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      </div>
      <div className="text-4xl font-black text-slate-800 mb-2">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{subtitle}</div>
    </div>
  );
};
