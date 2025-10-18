import { Timeframe, Asset } from './types';

export const TIMEFRAMES: Timeframe[] = ['1m', '5m', '1h', '1d'];

export const ASSET_DETAILS: Record<Asset, {
    name: string;
    symbol: string;
    tradingViewSymbol: string;
    accentClass: string;
    accentBgClass: string;
    glowColor: string;
    placeholderPrice: number;
    liveData: {
        provider: 'Binance' | 'TwelveData';
        wsUrl: string;
        getSubscriptionMessage: () => any;
        parseMessage: (event: MessageEvent) => { price: number; time: number } | null;
    }
}> = {
    'GC': {
        name: 'الذهب',
        symbol: 'GC',
        tradingViewSymbol: 'OANDA:XAUUSD', // Switched to a more common spot gold symbol
        accentClass: 'text-yellow-400',
        accentBgClass: 'bg-yellow-500',
        glowColor: 'rgba(250, 204, 21, 0.1)',
        placeholderPrice: 2320,
        liveData: {
            provider: 'TwelveData',
            wsUrl: 'wss://ws.twelvedata.com/v1/quotes/price?apikey=demo',
            getSubscriptionMessage: () => ({
                "action": "subscribe",
                "params": {"symbols": "XAU/USD"}
            }),
            parseMessage: (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                if (data.event === 'price' && data.symbol === 'XAU/USD') {
                    return { price: data.price, time: data.timestamp };
                }
                return null;
            }
        }
    },
    'BTC': {
        name: 'البيتكوين',
        symbol: 'BTC',
        tradingViewSymbol: 'BINANCE:BTCUSDT',
        accentClass: 'text-orange-400',
        accentBgClass: 'bg-orange-500',
        glowColor: 'rgba(251, 146, 60, 0.1)',
        placeholderPrice: 65000,
        liveData: {
            provider: 'Binance',
            wsUrl: 'wss://stream.binance.com:9443/ws/btcusdt@aggTrade',
            getSubscriptionMessage: () => null, // Binance doesn't need a subscription message for this stream
            parseMessage: (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                if (data.p) { // 'p' is price in Binance stream
                    return { price: parseFloat(data.p), time: data.E }; // 'E' is event time
                }
                return null;
            }
        }
    }
};