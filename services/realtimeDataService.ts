import { Timeframe, CandleData, Asset } from '../types';
import { ASSET_DETAILS } from '../constants';
import { ConnectionStatus } from '../components/ChartContainer';

// Simulation parameters for Volume and OI on top of live data
const LIVE_SIM_PARAMS = {
    oiFactor: 150,
    volumeBase: 200,
    volumeFactor: 1000,
};

type UpdateCallback = (data: { candles: CandleData[], signals: CandleData[], metrics: { totalOpenInterest: number } }) => void;
type StatusCallback = (status: ConnectionStatus) => void;

export class RealtimeDataService {
    private asset: Asset;
    private timeframe: Timeframe;
    private onUpdate: UpdateCallback;
    private onStatusChange: StatusCallback;
    private ws: WebSocket | null = null;
    
    private candles: CandleData[] = [];
    private signals: CandleData[] = [];
    private currentCandle: Partial<CandleData> | null = null;
    private lastTickPrice: number | null = null;
    private totalOpenInterest: number = 500000 + Math.floor((Math.random() - 0.5) * 10000);
    
    constructor(asset: Asset, timeframe: Timeframe, onUpdate: UpdateCallback, onStatusChange: StatusCallback) {
        this.asset = asset;
        this.timeframe = timeframe;
        this.onUpdate = onUpdate;
        this.onStatusChange = onStatusChange;
    }

    public connect() {
        if (this.ws) {
            this.disconnect();
        }

        const assetDetails = ASSET_DETAILS[this.asset];
        this.ws = new WebSocket(assetDetails.liveData.wsUrl);

        this.ws.onopen = () => {
            this.onStatusChange('connected');
            const subMessage = assetDetails.liveData.getSubscriptionMessage();
            if (subMessage) {
                this.ws?.send(JSON.stringify(subMessage));
            }
        };

        this.ws.onmessage = (event: MessageEvent) => {
            const parsed = assetDetails.liveData.parseMessage(event);
            if (parsed) {
                this.aggregateTick(parsed.price, parsed.time);
            }
        };

        this.ws.onerror = () => {
            this.onStatusChange('error');
            console.error('WebSocket error');
        };

        this.ws.onclose = () => {
            this.onStatusChange('disconnected');
        };
    }

    public disconnect() {
        this.ws?.close();
        this.ws = null;
    }
    
    private getTimeframeSeconds(): number {
        const map = { '1m': 60, '5m': 300, '1h': 3600, '1d': 86400 };
        return map[this.timeframe];
    }
    
    private getCandleStartTime(timestamp: number): number {
        const timeframeSeconds = this.getTimeframeSeconds();
        return Math.floor(timestamp / (timeframeSeconds)) * timeframeSeconds;
    }
    
    private aggregateTick(price: number, time: number) {
        const candleTime = this.getCandleStartTime(time / 1000); 

        if (!this.currentCandle || this.currentCandle.time !== candleTime) {
            if (this.currentCandle && this.currentCandle.open) {
                this.currentCandle.close = this.lastTickPrice ?? price;
                this.finalizeCandle(this.currentCandle as CandleData);
            }
            this.currentCandle = {
                time: candleTime,
                open: price,
                high: price,
                low: price,
                close: price,
                volume: 0,
            };
        } else {
            this.currentCandle.high = Math.max(this.currentCandle.high ?? price, price);
            this.currentCandle.low = Math.min(this.currentCandle.low ?? price, price);
            this.currentCandle.close = price;
        }
        this.lastTickPrice = price;
    }

    private finalizeCandle(candle: CandleData) {
        // Simulate Volume and DeltaOI now that the candle is complete
        const priceChange = candle.close - candle.open;
        candle.volume = Math.round(LIVE_SIM_PARAMS.volumeBase + Math.random() * LIVE_SIM_PARAMS.volumeFactor);
        candle.deltaOI = Math.floor((Math.random() - 0.45 + (priceChange > 0 ? 0.1 : -0.1)) * LIVE_SIM_PARAMS.oiFactor);
        
        this.totalOpenInterest += candle.deltaOI!;
        candle.openInterest = this.totalOpenInterest;

        this.analyzeSignal(candle);

        this.candles.push(candle);

        if (candle.signal) {
            this.signals.push(candle);
        }

        if (this.candles.length > 150) this.candles.shift();
        if (this.signals.length > 50) this.signals.shift();
        
        this.pushUpdate();
    }

    private analyzeSignal(candle: CandleData) {
        const volumeThreshold = (LIVE_SIM_PARAMS.volumeBase + LIVE_SIM_PARAMS.volumeFactor) * 0.6;
        const oiPositiveThreshold = LIVE_SIM_PARAMS.oiFactor * 0.4;
        const oiNegativeThreshold = -LIVE_SIM_PARAMS.oiFactor * 0.25;

        const isUp = candle.close > candle.open;
        const isDown = candle.close < candle.open;
        const hasHighVolume = candle.volume > volumeThreshold;
        
        if (!candle.deltaOI) return;

        if (hasHighVolume) {
            if (isUp && candle.deltaOI > oiPositiveThreshold) {
                candle.signal = 'bullish_continuation';
            } else if (isDown && candle.deltaOI > oiPositiveThreshold) {
                candle.signal = 'bearish_continuation';
            } else if (isUp && candle.deltaOI < oiNegativeThreshold) {
                candle.signal = 'bullish_exhaustion';
            } else if (isDown && candle.deltaOI < oiNegativeThreshold) {
                candle.signal = 'bearish_exhaustion';
            }
        }
    }
    
    private pushUpdate() {
        this.onUpdate({
            candles: [...this.candles],
            signals: [...this.signals],
            metrics: { totalOpenInterest: this.totalOpenInterest }
        });
    }
}