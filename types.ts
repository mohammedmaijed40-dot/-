export type Timeframe = '1m' | '5m' | '1h' | '1d';
export type Asset = 'GC' | 'BTC';

export type SignalType = 
    | 'bullish_continuation' 
    | 'bearish_continuation' 
    | 'bullish_exhaustion' 
    | 'bearish_exhaustion';

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openInterest: number;
  deltaOI?: number;
  signal?: SignalType | null;
}

export type EntrySignal = {
  type: 'buy' | 'sell';
  price: number;
  time: number;
  reason: string;
  originalSignal: SignalType;
};
