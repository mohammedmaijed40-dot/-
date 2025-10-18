import React from 'react';
import { EntrySignal } from '../types';

interface EntrySignalPanelProps {
    buySignal: EntrySignal | null;
    sellSignal: EntrySignal | null;
    isLoading: boolean;
}

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);

const ArrowDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const SignalCard = ({ signal, type }: { signal: EntrySignal | null, type: 'buy' | 'sell' }) => {
    const isBuy = type === 'buy';
    const accentColor = isBuy ? 'text-green-400' : 'text-red-400';
    const bgColor = isBuy ? 'bg-green-500/10' : 'bg-red-500/10';
    const borderColor = isBuy ? 'border-green-500/30' : 'border-red-500/30';
    const title = isBuy ? 'إشارة شراء' : 'إشارة بيع';
    const waitingText = isBuy ? 'في انتظار إشارة شراء...' : 'في انتظار إشارة بيع...';
    
    if (!signal) {
        return (
            <div className={`p-4 rounded-lg flex-1 ${bgColor} border ${borderColor} flex items-center justify-center`}>
                <p className="text-slate-500 text-sm">{waitingText}</p>
            </div>
        );
    }
    
    return (
        <div className={`p-4 rounded-lg flex-1 ${bgColor} border ${borderColor}`}>
            <div className="flex items-center gap-3">
                <div className={accentColor}>
                    {isBuy ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </div>
                <h4 className={`font-bold text-lg ${accentColor}`}>{title}</h4>
            </div>
            <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-400">الوقت:</span>
                    <span className="font-mono text-slate-200">{new Date(signal.time * 1000).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">السعر:</span>
                    <span className="font-mono font-bold text-slate-100">{signal.price.toFixed(2)}</span>
                </div>
                 <div className="text-right mt-2">
                    <p className="text-xs text-slate-300">{signal.reason}</p>
                </div>
            </div>
        </div>
    );
};


const EntrySignalPanel: React.FC<EntrySignalPanelProps> = ({ buySignal, sellSignal, isLoading }) => {
    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-center text-slate-300">إشارات الدخول الأخيرة</h3>
            {isLoading ? (
                <div className="flex-grow flex items-center justify-center">
                    <span className="text-slate-400">...</span>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row xl:flex-col gap-4 flex-grow">
                   <SignalCard signal={buySignal} type="buy" />
                   <SignalCard signal={sellSignal} type="sell" />
                </div>
            )}
        </div>
    );
};

export default EntrySignalPanel;
