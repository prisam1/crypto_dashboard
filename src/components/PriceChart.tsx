import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { ChartDataPoint } from '../types/types';

interface Props {
    data: ChartDataPoint[];
    coinName: string;
    loading: boolean;
    error?: string | null;
}

const TooltipContent = ({ payload }: any) => {
    if (!payload || !payload.length) return null;
    const p = payload[0].payload as ChartDataPoint;
    return (
        <div className="bg-gray-900 p-2 rounded shadow border border-gray-700 text-white">
            <div className="text-sm">{p.date}</div>
            <div className="font-semibold">${p.price.toFixed(2)}</div>
        </div>
    );
};

const PriceChart: React.FC<Props> = ({ data, coinName, loading, error }) => {
    return (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl h-[420px] w-full">
            <h3 className="text-xl font-bold text-white mb-4 text-center">{coinName} - Last 6 hours</h3>

            {loading ? (
                <div className="flex items-center justify-center h-[340px] text-gray-400">Loading chart...</div>
            ) : error ? (
                <div className="text-red-400 text-center">{error}</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151" />
                        <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <YAxis
                            stroke="#9ca3af"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            domain={["auto", "auto"]}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<TooltipContent />} />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: '#2563eb' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default PriceChart;
