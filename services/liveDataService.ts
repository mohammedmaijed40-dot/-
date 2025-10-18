import { Timeframe, CandleData, SignalType } from '../types';
import { getHistoricalGoldData } from './mockDataService';

// More sophisticated simulation parameters
const SIMULATION_PARAMS = {
    volatility: 0.05, 
    trendStrength: 0.03,
    meanReversion: 0.01,
    
    oiBase: 500000,
    oiFactor: 200,
    volumeBase: 500,
    volumeFactor: 1500,
    
    trendChangeProbability: 0.02,
    highVolatilityProbability: 0.05,
};

type UpdateCallback = (data: { candles: CandleData[], signals: CandleData[], metrics: { totalOpenInterest: number } }) => void;

export class LiveDataSimulator {
    private timeframe: Timeframe;
    private intervalId: number | null = null;
    private candles: CandleData[] = [];
    private signals: CandleData[] = [];
    private totalOpenInterest: number;
    private currentPrice: number;
    private trendDirection: number;
    private currentVolatility: number;
    private currentTime: number;
    private basePrice: number;

    constructor(timeframe: Timeframe, startPrice: number) {
        this.timeframe = timeframe;
        this.basePrice = startPrice;
        const initialData = this.generateInitialCandles(startPrice);
        this.candles = initialData.candles;
        this.signals = initialData.signals;
        this.totalOpenInterest = initialData.metrics.totalOpenInterest;
        
        const lastCandle = this.candles[this.candles.length - 1];
        this.currentPrice = lastCandle.close;
        this.currentTime = lastCandle.time;
        this.trendDirection = Math.random() > 0.5 ? 1 : -1;
        this.currentVolatility = SIMULATION_PARAMS.volatility;
    }

    private generateInitialCandles(startPrice: number) {
        return getHistoricalGoldData(this.timeframe, startPrice);
    }
    
    private generateNextCandle(): CandleData {
        const {
            volatility, trendStrength, meanReversion,
            oiFactor, volumeBase, volumeFactor,
            trendChangeProbability, highVolatilityProbability
        } = SIMULATION_PARAMS;

        const timeframeSeconds = { '1m': 60, '5m': 300, '1h': 3600, '1d': 86400 }[this.timeframe];
        this.currentTime += timeframeSeconds;

        if (Math.random() < trendChangeProbability) this.trendDirection *= -1;
        if (Math.random() < highVolatilityProbability) {
            this.currentVolatility = volatility * (2 + Math.random() * 2);
        } else {
            this.currentVolatility = volatility;
        }

        const open = this.currentPrice;
        const priceMagnitudeFactor = (open / this.basePrice);
        const randomMove = (Math.random() - 0.5) * 2 * this.currentVolatility * priceMagnitudeFactor;
        const trendMove = this.trendDirection * trendStrength * Math.random() * priceMagnitudeFactor;
        const reversionMove = (this.basePrice - open) * meanReversion;
        const close = open + randomMove + trendMove + reversionMove;
        const high = Math.max(open, close) + Math.random() * this.currentVolatility * priceMagnitudeFactor;
        const low = Math.min(open, close) - Math.random() * this.currentVolatility * priceMagnitudeFactor;

        const volumeSpike = this.currentVolatility > volatility ? 1.5 : 1;
        const volume = volumeBase + Math.floor(Math.random() * volumeFactor * volumeSpike);
        
        const oiTrend = (close - open) * this.trendDirection > 0 ? 1.2 : -0.8;
        const deltaOI = Math.floor((Math.random() - 0.55) * oiFactor * (volume / (volumeBase + volumeFactor / 2)) + (oiTrend * 50));
        this.totalOpenInterest += deltaOI;

        const newCandle: CandleData = {
            time: this.currentTime,
            open, high, low, close, volume,
            openInterest: this.totalOpenInterest,
            deltaOI,
            signal: null
        };
        this.currentPrice = close;
        
        // --- Advanced Signal Analysis ---
        const volumeThreshold = (volumeBase + volumeFactor) * 0.7;
        const oiPositiveThreshold = oiFactor * 0.5;
        const oiNegativeThreshold = -oiFactor * 0.3;

        const isUp = newCandle.close > newCandle.open;
        const isDown = newCandle.close < newCandle.open;
        const hasHighVolume = newCandle.volume > volumeThreshold;

        if (hasHighVolume) {
            if (isUp && newCandle.deltaOI > oiPositiveThreshold) {
                newCandle.signal = 'bullish_continuation';
            } else if (isDown && newCandle.deltaOI > oiPositiveThreshold) {
                newCandle.signal = 'bearish_continuation';
            } else if (isUp && newCandle.deltaOI < oiNegativeThreshold) {
                newCandle.signal = 'bullish_exhaustion';
            } else if (isDown && newCandle.deltaOI < oiNegativeThreshold) {
                newCandle.signal = 'bearish_exhaustion';
            }
        }

        return newCandle;
    }

    public start(onUpdate: UpdateCallback) {
        this.stop(); 
        const updateInterval = this.timeframe === '1m' ? 3000 : 5000;

        onUpdate({
            candles: [...this.candles],
            signals: [...this.signals],
            metrics: { totalOpenInterest: this.totalOpenInterest }
        });

        this.intervalId = window.setInterval(() => {
            const newCandle = this.generateNextCandle();
            this.candles.push(newCandle);

            if (this.candles.length > 150) {
                this.candles.shift();
            }

            if (newCandle.signal) {
                this.signals.push(newCandle);
                 if (this.signals.length > 50) {
                    this.signals.shift(); 
                }
            }
            
            onUpdate({
                candles: [...this.candles],
                signals: [...this.signals],
                metrics: { totalOpenInterest: this.totalOpenInterest }
            });

        }, updateInterval);
    }

    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}