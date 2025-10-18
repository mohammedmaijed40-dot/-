import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell, Scatter, ZAxis } from 'recharts';
import { CandleData, SignalType } from '../types';

interface CandlestickChartProps {
    data: CandleData[];
    isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Find the candle data, it could be in payload[0] or payload[1] etc.
        const candlePayload = payload.find(p => p.dataKey === 'ohlc');
        if (!candlePayload) return null;

        const data = candlePayload.payload;
        const ohlc = data.ohlc;
        return (
            <div className="bg-slate-700 p-3 rounded-md border border-slate-600 text-sm">
                <p className="label text-slate-300">{`الوقت: ${new Date(label * 1000).toLocaleString()}`}</p>
                <p className="text-yellow-400">{`فتح: ${ohlc[0].toFixed(2)}`}</p>
                <p className="text-green-400">{`أعلى: ${ohlc[1].toFixed(2)}`}</p>
                <p className="text-red-400">{`أدنى: ${ohlc[2].toFixed(2)}`}</p>
                <p className="text-blue-400">{`إغلاق: ${ohlc[3].toFixed(2)}`}</p>
                <p className="text-purple-400">{`حجم التداول: ${data.volume.toLocaleString()}`}</p>
                <p className="text-cyan-400">{`ΔOI: ${data.deltaOI.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};

const CandlestickShape = (props: any) => {
    const { x, y, width, height, ohlc } = props;
    const [open, high, low, close] = ohlc;
    const isUp = close >= open;
    const color = isUp ? '#22c55e' : '#ef4444';
    const bodyHeight = Math.max(1, Math.abs(open - close) / (high - low) * height);
    const bodyY = isUp ? y + (high - close) / (high - low) * height : y + (high - open) / (high - low) * height;
    
    const wickX = x + width / 2;

    return (
        <g stroke={color} fill={isUp ? color : 'none'} strokeWidth="1">
            <path d={`M ${wickX},${y} L ${wickX},${y + height}`} />
            <rect x={x} y={bodyY} width={width} height={bodyHeight} fill={isUp ? color : '#ef4444'} />
        </g>
    );
};

const SignalShape = (props: { cx?: number, cy?: number, payload?: any }) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || !payload || !payload.signal) return null;

    const signal: SignalType = payload.signal;
    const size = 6;
    let shape = null;

    switch (signal) {
        case 'bullish_continuation': // Up arrow
            shape = <path d={`M${cx} ${cy-size} L${cx+size} ${cy+size} L${cx-size} ${cy+size} Z`} fill="#22c55e" />;
            break;
        case 'bearish_continuation': // Down arrow
            shape = <path d={`M${cx} ${cy+size} L${cx+size} ${cy-size} L${cx-size} ${cy-size} Z`} fill="#ef4444" />;
            break;
        case 'bullish_exhaustion': // Square
            shape = <rect x={cx-size/2} y={cy-size/2} width={size} height={size} fill="#a3e635" />; // lime-400
            break;
        case 'bearish_exhaustion': // Square
            shape = <rect x={cx-size/2} y={cy-size/2} width={size} height={size} fill="#f87171" />; // red-400
            break;
    }
    return <g>{shape}</g>;
};


const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-slate-500">جاري بدء محاكاة البيانات الحية...</div>;
    }

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500">لا توجد بيانات لعرضها.</div>;
    }

    const chartData = data.map(d => ({
        time: d.time,
        ohlc: [d.open, d.high, d.low, d.close],
        volume: d.volume,
        deltaOI: d.deltaOI ?? 0,
        signal: d.signal,
        signalPosition: d.signal ? (d.signal.includes('bullish') ? d.low : d.high) : null
    }));

    const yDomain = [
        Math.min(...data.map(d => d.low)) * 0.99,
        Math.max(...data.map(d => d.high)) * 1.01
    ];
    
    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="time" tickFormatter={(time) => new Date(time * 1000).toLocaleTimeString()} tick={{ fill: '#94a3b8' }} />
                <YAxis yAxisId="left" domain={yDomain} orientation="left" tickFormatter={(val) => val.toFixed(2)} tick={{ fill: '#94a3b8' }} width={70} />
                <YAxis yAxisId="right" domain={[0, Math.max(...data.map(d => d.volume)) * 3]} orientation="right" tick={{ fill: '#94a3b8' }} hide />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Bar yAxisId="left" dataKey="ohlc" shape={<CandlestickShape />} isAnimationActive={false}>
                    <LabelList dataKey="deltaOI" position="bottom" offset={10} formatter={(label: number) => label !== 0 ? label.toLocaleString() : ''} style={{ fill: 'white', fontSize: 10 }}>
                        {
                            chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.deltaOI >= 0 ? '#22c55e' : '#ef4444'} />
                            ))
                        }
                    </LabelList>
                </Bar>
                
                <Bar yAxisId="right" dataKey="volume" barSize={20} isAnimationActive={false}>
                    {
                        chartData.map((entry, index) => {
                            const color = entry.ohlc[3] >= entry.ohlc[0] ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
                            return <Cell key={`cell-${index}`} fill={color} />;
                        })
                    }
                </Bar>
                
                <ZAxis dataKey="signalPosition" domain={yDomain} range={[0, 400]} />
                <Scatter yAxisId="left" dataKey="signalPosition" shape={<SignalShape />} />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default CandlestickChart;