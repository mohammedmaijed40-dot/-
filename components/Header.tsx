import React from 'react';
import { Asset, CandleData } from '../types';
import { ASSET_DETAILS } from '../constants';
import { ConnectionStatus } from './ChartContainer';

interface HeaderProps {
    assetDetails: typeof ASSET_DETAILS[Asset];
    onInfoClick: () => void;
    totalOpenInterest: number;
    candleData: CandleData[];
    connectionStatus: ConnectionStatus | null;
}

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ConnectionStatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
    const statusInfo = {
        'connecting': { text: 'جاري الاتصال...', color: 'bg-yellow-500' },
        'connected': { text: 'متصل', color: 'bg-green-500' },
        'disconnected': { text: 'انقطع الاتصال', color: 'bg-gray-500' },
        'error': { text: 'خطأ', color: 'bg-red-500' },
    };
    const { text, color } = statusInfo[status];

    return (
        <div className="flex items-center space-x-2 space-x-reverse text-xs">
            <span className={`h-2 w-2 rounded-full ${color} animate-pulse`}></span>
            <span className="text-slate-300">{text}</span>
        </div>
    );
}

const Header: React.FC<HeaderProps> = ({ assetDetails, onInfoClick, totalOpenInterest, candleData, connectionStatus }) => {
    const lastCandle = candleData.length > 0 ? candleData[candleData.length - 1] : null;
    const firstCandle = candleData.length > 0 ? candleData[0] : null;

    let changePercent: number | null = null;
    if (lastCandle && firstCandle) {
        changePercent = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;
    }
    const changeColor = changePercent === null ? 'text-slate-200' : changePercent >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-slate-700 pb-4 gap-4">
            <div className="flex-grow">
                 <div className="flex items-center gap-4">
                    <h1 className={`text-2xl sm:text-3xl font-bold ${assetDetails.accentClass} transition-colors duration-300`}>
                        تحليل {assetDetails.name} ({assetDetails.symbol})
                    </h1>
                    {connectionStatus && <ConnectionStatusIndicator status={connectionStatus} />}
                </div>
                <p className="text-sm text-slate-400 mt-1">
                    عرض مباشر للسوق (أعلى) وأداة تحليل التدفق (أسفل)
                </p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse w-full sm:w-auto justify-end">
                <div className="text-right">
                    <span className="text-xs text-slate-400 block">آخر سعر</span>
                    <span className={`font-bold text-lg ${changeColor}`}>{lastCandle ? lastCandle.close.toFixed(2) : '...'}</span>
                </div>
                 <div className="text-right">
                    <span className="text-xs text-slate-400 block">التغير</span>
                    <span className={`font-bold text-lg ${changeColor}`}>{changePercent !== null ? `${changePercent.toFixed(2)}%` : '...'}</span>
                </div>
                <div className="text-right">
                    <span className="text-xs text-slate-400 block">إجمالي العقود</span>
                    <span className="font-bold text-lg text-slate-200">{totalOpenInterest > 0 ? totalOpenInterest.toLocaleString() : '...'}</span>
                </div>
                <button onClick={onInfoClick} className={`text-slate-400 hover:${assetDetails.accentClass} transition-colors`}>
                    <InfoIcon />
                </button>
            </div>
        </div>
    );
};

export default Header;