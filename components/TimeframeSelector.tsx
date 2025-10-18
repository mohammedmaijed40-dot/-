import React from 'react';
import { Timeframe } from '../types';

interface TimeframeSelectorProps {
    timeframes: Timeframe[];
    activeTimeframe: Timeframe;
    onSelect: (timeframe: Timeframe) => void;
    accentBgClass: string;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ timeframes, activeTimeframe, onSelect, accentBgClass }) => {
    return (
        <div className="flex items-center space-x-2 space-x-reverse bg-slate-900 p-1 rounded-md">
            {timeframes.map((tf) => (
                <button
                    key={tf}
                    onClick={() => onSelect(tf)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeTimeframe === tf
                            ? `${accentBgClass} text-slate-900`
                            : 'bg-transparent text-slate-400 hover:bg-slate-700 hover:text-slate-100'
                    }`}
                >
                    {tf.toUpperCase()}
                </button>
            ))}
        </div>
    );
};

export default TimeframeSelector;