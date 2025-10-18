import React from 'react';
import { CandleData, SignalType } from '../types';

interface SignalTableProps {
    signals: CandleData[];
    isLoading: boolean;
}

const SignalTable: React.FC<SignalTableProps> = ({ signals, isLoading }) => {
    
    const getSignalInfo = (signal: SignalType | null | undefined) => {
        switch (signal) {
            case 'bullish_continuation':
                return { text: 'استمرار صعودي', classes: 'bg-green-500/20 text-green-400' };
            case 'bearish_continuation':
                return { text: 'استمرار هبوطي', classes: 'bg-red-500/20 text-red-400' };
            case 'bullish_exhaustion':
                return { text: 'تشبع شرائي', classes: 'bg-lime-500/20 text-lime-400' };
            case 'bearish_exhaustion':
                return { text: 'تشبع بيعي', classes: 'bg-rose-500/20 text-rose-400' };
            default:
                return { text: '---', classes: 'bg-slate-700 text-slate-300' };
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-center text-slate-300">سجل الإشارات الكامل</h3>
            <div className="flex-grow overflow-y-auto pr-2 relative">
                {isLoading && (
                     <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-80 z-10">
                        <span className="text-slate-400">في انتظار بيانات المحاكاة...</span>
                    </div>
                )}
                <div className="w-full text-sm text-right">
                    <div className="sticky top-0 bg-slate-900 z-10 grid grid-cols-4 gap-2 pb-2 border-b border-slate-700">
                        <div className="p-2 font-medium text-slate-400">الوقت</div>
                        <div className="p-2 font-medium text-slate-400">النوع</div>
                        <div className="p-2 font-medium text-slate-400">الحجم</div>
                        <div className="p-2 font-medium text-slate-400">ΔOI</div>
                    </div>
                    <div className="divide-y divide-slate-800">
                        {signals.slice().reverse().map((signal, index) => {
                            const signalInfo = getSignalInfo(signal.signal);
                            return (
                                <div key={index} className="grid grid-cols-4 gap-2 py-2 items-center">
                                    <div className="p-2 text-slate-300">{new Date(signal.time * 1000).toLocaleTimeString()}</div>
                                    <div className="p-2">
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${signalInfo.classes}`}>
                                            {signalInfo.text}
                                        </span>
                                    </div>
                                    <div className="p-2 text-slate-300">{signal.volume.toLocaleString()}</div>
                                    <div className={`p-2 font-mono ${signal.deltaOI && signal.deltaOI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {signal.deltaOI ? signal.deltaOI.toLocaleString() : '-'}
                                    </div>
                                </div>
                            )
                        })}
                         {!isLoading && signals.length === 0 && (
                            <div className="text-center p-8 text-slate-500 col-span-4">
                                لم يتم رصد إشارات قوية بعد.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignalTable;
