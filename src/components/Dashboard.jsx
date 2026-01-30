import React, { useEffect, useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Activity, AlertTriangle, MapPin, Search } from 'lucide-react';
import { processData } from '../utils/analytics';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = ({ rawData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [processedData, setProcessedData] = useState(null);

    // Filter rawData based on search term
    const filteredRawData = useMemo(() => {
        if (!rawData) return [];
        if (!searchTerm.trim()) return rawData;

        const lowerTerm = searchTerm.toLowerCase();
        return rawData.filter(item => {
            const searchFields = [
                item.location,
                item.primary_category,
                item.near_miss_sub_category,
                item.action_cause,
                item.unsafe_condition_or_behavior
            ];

            return searchFields.some(field =>
                field && String(field).toLowerCase().includes(lowerTerm)
            );
        });
    }, [rawData, searchTerm]);

    // Process data whenever filtered data changes
    useEffect(() => {
        if (filteredRawData) {
            const processed = processData(filteredRawData);
            setProcessedData(processed);
        }
    }, [filteredRawData]);

    if (!processedData) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-xl text-gray-500">Loading Dashboard Data...</p>
            </div>
        );
    }

    const { kpis, charts } = processedData;

    return (
        <div className="space-y-6">
            {/* Header with Search */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
                <div className="relative w-full md:w-64">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Search dashboard..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Top Row: KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Incidents</p>
                            <p className="text-2xl font-bold text-gray-900">{kpis.totalIncidents.toLocaleString()}</p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                            <Activity size={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">High Risk & Critical</p>
                            <p className="text-2xl font-bold text-red-600">{kpis.highRiskCount.toLocaleString()}</p>
                        </div>
                        <div className="rounded-full bg-red-100 p-3 text-red-600">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Unique Locations</p>
                            <p className="text-2xl font-bold text-emerald-600">{kpis.uniqueLocations.toLocaleString()}</p>
                        </div>
                        <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                            <MapPin size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Row: Trends & Severity */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Timeline Chart */}
                <div className="rounded-lg bg-white p-6 shadow-md lg:col-span-2">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Incident Trend (Monthly)</h3>
                    <div className="h-64 md:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.timeline}>
                                <defs>
                                    <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    tickMargin={10}
                                />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    name="Incidents"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorIncidents)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Severity Chart (Donut) */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Severity Distribution</h3>
                    <div className="h-64 md:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.severity}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {charts.severity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Categorical Analysis */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Top Locations */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Top 10 Locations</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={charts.location}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={100}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" name="Incidents" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Incident Types */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Top 5 Incident Categories</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={charts.type}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" name="Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
