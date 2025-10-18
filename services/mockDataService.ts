import { Timeframe, CandleData, SignalType } from '../types';

// More sophisticated simulation parameters
const SIMULATION_PARAMS = {
    volatility: 0.1, // Base volatility
    trendStrength: 0.05, // How much trend influences price
    meanReversion: 0.01, // How much price reverts to mean
    
    // Volume & OI
    oiBase: 500000,
    oiFactor: 200, // Max OI change per candle
    volumeBase: 500,
    volumeFactor: 1500,
    
    // Probabilities
    trendChangeProbability: 0.05, // 5% chance of trend reversing per candle
    highVolatilityProbability: 0.1, // 10% chance of a high volatility period
};

export const getHistoricalGoldData = (timeframe: Timeframe, basePrice: number): { candles: CandleData[], signals: CandleData[], metrics: { totalOpenInterest: number } } => {
    const candles: CandleData[] = [];
    const signals: CandleData[] = [];
    
    const {
        volatility, trendStrength, meanReversion,
        oiBase, oiFactor, volumeBase, volumeFactor,
        trendChangeProbability, highVolatilityProbability
    } = SIMULATION_PARAMS;
    
    const timeframeSeconds = { '1m': 60, '5m': 300, '1h': 3600, '1d': 86400 }[timeframe];
    const totalCandles = 100;
    let currentTime = Math.floor(Date.now() / 1000) - (totalCandles * timeframeSeconds);
    let totalOpenInterest = oiBase + Math.floor((Math.random() - 0.5) * 5000);
    
    let currentPrice = basePrice;
    let trendDirection = Math.random() > 0.5 ? 1 : -1; // 1 for up, -1 for down
    let currentVolatility = volatility;

    for (let i = 0; i < totalCandles; i++) {
        // --- State changes for simulation ---
        if (Math.random() < trendChangeProbability) {
            trendDirection *= -1; // Reverse trend
        }
        if (Math.random() < highVolatilityProbability) {
            currentVolatility = volatility * (2 + Math.random() * 2); // Spike volatility
        } else {
            currentVolatility = volatility; // Revert to base
        }

        // --- Price Calculation ---
        const open = currentPrice;
        
        const randomMove = (Math.random() - 0.5) * 2 * currentVolatility;
        const trendMove = trendDirection * trendStrength * Math.random();
        const reversionMove = (basePrice - open) * meanReversion;
        
        const close = open + randomMove + trendMove + reversionMove;
        
        const high = Math.max(open, close) + Math.random() * currentVolatility;
        const low = Math.min(open, close) - Math.random() * currentVolatility;
        
        // --- Volume & OI Calculation ---
        const volumeSpike = currentVolatility > volatility ? 1.5 : 1;
        const volume = volumeBase + Math.floor(Math.random() * volumeFactor * volumeSpike);
        
        // Make deltaOI more varied, including negative values
        const oiTrend = (close - open) * trendDirection > 0 ? 1.2 : -0.8; 
        const deltaOI = Math.floor(
            (Math.random() - 0.55) * oiFactor * (volume / (volumeBase + volumeFactor / 2)) + (oiTrend * 50)
        );
        
        totalOpenInterest += deltaOI;
        
        const newCandle: CandleData = {
            time: currentTime,
            open, high, low, close, volume,
            openInterest: totalOpenInterest,
            deltaOI,
            signal: null
        };
        currentPrice = close;

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
        
        if (newCandle.signal) {
            signals.push(newCandle);
        }

        candles.push(newCandle);
        currentTime += timeframeSeconds;
    }

    return { candles, signals, metrics: { totalOpenInterest } };
};