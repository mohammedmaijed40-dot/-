import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timeframe, Asset, CandleData, EntrySignal } from '../types';
import { TIMEFRAMES, ASSET_DETAILS } from '../constants';
import TimeframeSelector from './TimeframeSelector';
import Header from './Header';
import InfoModal from './InfoModal';
import TradingViewWidget from './TradingViewWidget';
import CandlestickChart from './CandlestickChart';
import SignalTable from './SignalTable';
import { RealtimeDataService } from '../services/realtimeDataService';
import EntrySignalPanel from './EntrySignalPanel';

interface ChartContainerProps {
    asset: Asset;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface LatestMetrics {
    totalOpenInterest: number;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ asset }) => {
    const [timeframe, setTimeframe] = useState<Timeframe>('1m');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [candleData, setCandleData] = useState<CandleData[]>([]);
    const [signals, setSignals] = useState<CandleData[]>([]);
    const [latestMetrics, setLatestMetrics] = useState<LatestMetrics>({ totalOpenInterest: 0 });
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    
    // Entry Signals State
    const [latestBuySignal, setLatestBuySignal] = useState<EntrySignal | null>(null);
    const [latestSellSignal, setLatestSellSignal] = useState<EntrySignal | null>(null);

    // Live data service ref
    const liveServiceRef = useRef<RealtimeDataService | null>(null);

    const assetDetails = ASSET_DETAILS[asset];

    const resetState = useCallback(() => {
        setCandleData([]);
        setSignals([]);
        setLatestMetrics({ totalOpenInterest: 0 });
        setLatestBuySignal(null);
        setLatestSellSignal(null);
    }, []);
    

    // Effect to handle live data connection
    useEffect(() => {
        // Cleanup on asset or timeframe change
        liveServiceRef.current?.disconnect();
        resetState();
        setConnectionStatus('disconnected');

        const connectLive = () => {
            setConnectionStatus('connecting');
            
            const service = new RealtimeDataService(
                asset,
                timeframe,
                (data) => {
                    setCandleData(data.candles);
                    setSignals(data.signals);
                    setLatestMetrics(data.metrics);
                },
                (status) => setConnectionStatus(status)
            );
            liveServiceRef.current = service;
            service.connect();
        };
        
        connectLive();
        
        return () => {
            liveServiceRef.current?.disconnect();
        };
    }, [asset, timeframe, resetState]);

    // Effect to process signals into entry signals
    useEffect(() => {
        if (signals.length > 0) {
            const latestSignal = signals[signals.length - 1];
            let newEntrySignal: EntrySignal | null = null;

            switch (latestSignal.signal) {
                case 'bullish_continuation':
                    newEntrySignal = { type: 'buy', price: latestSignal.close, time: latestSignal.time, reason: 'زخم شرائي: مشترون جدد يدخلون السوق.', originalSignal: latestSignal.signal };
                    break;
                case 'bearish_exhaustion':
                     newEntrySignal = { type: 'buy', price: latestSignal.close, time: latestSignal.time, reason: 'انعكاس محتمل: البائعون يغلقون مراكزهم.', originalSignal: latestSignal.signal };
                    break;
                case 'bearish_continuation':
                    newEntrySignal = { type: 'sell', price: latestSignal.close, time: latestSignal.time, reason: 'زخم بيعي: بائعون جدد يدخلون السوق.', originalSignal: latestSignal.signal };
                    break;
                case 'bullish_exhaustion':
                    newEntrySignal = { type: 'sell', price: latestSignal.close, time: latestSignal.time, reason: 'انعكاس محتمل: المشترون يجنون أرباحهم.', originalSignal: latestSignal.signal };
                    break;
            }
            
            if (newEntrySignal) {
                if (newEntrySignal.type === 'buy') {
                    setLatestBuySignal(newEntrySignal);
                } else {
                    setLatestSellSignal(newEntrySignal);
                }
            }
        }
    }, [signals]);

    const timeframeMap: Record<Timeframe, string> = { '1m': '1', '5m': '5', '1h': '60', '1d': 'D' };
    const isLoading = connectionStatus === 'connecting' && candleData.length === 0;

    return (
        <div className="bg-slate-800 rounded-lg shadow-2xl p-4 md:p-6">
            <Header
                assetDetails={assetDetails}
                onInfoClick={() => setIsModalOpen(true)}
                totalOpenInterest={latestMetrics.totalOpenInterest}
                candleData={candleData}
                connectionStatus={connectionStatus}
            />
            
            <div className="h-[500px] md:h-[600px] w-full border border-slate-700 rounded-md my-4">
                <TradingViewWidget
                    symbol={assetDetails.tradingViewSymbol}
                    interval={timeframeMap[timeframe]}
                />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
                <div className="text-center mb-4">
                    <h2 className={`text-xl sm:text-2xl font-bold ${assetDetails.accentClass}`}>
                        أداة تحليل تدفق السيولة (ΔOI)
                    </h2>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                     <TimeframeSelector
                        timeframes={TIMEFRAMES}
                        activeTimeframe={timeframe}
                        onSelect={setTimeframe}
                        accentBgClass={assetDetails.accentBgClass}
                    />
                </div>
                 
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-slate-900 p-4 rounded-lg min-h-[400px]">
                        <CandlestickChart data={candleData} isLoading={isLoading} />
                    </div>
                    <div className="xl:col-span-1 flex flex-col gap-6">
                         <div className="bg-slate-900 p-4 rounded-lg">
                            <EntrySignalPanel 
                                buySignal={latestBuySignal}
                                sellSignal={latestSellSignal}
                                isLoading={candleData.length === 0}
                            />
                        </div>
                        <div className="bg-slate-900 p-4 rounded-lg min-h-[400px] flex-grow flex flex-col">
                           <SignalTable signals={signals} isLoading={candleData.length === 0} />
                        </div>
                    </div>
                </div>

            </div>

            <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} assetDetails={assetDetails}/>
        </div>
    );
};

export default ChartContainer;