import React, { useEffect, useRef } from 'react';

declare const TradingView: any;

interface TradingViewWidgetProps {
    symbol: string;
    interval: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, interval }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<any>(null);

    useEffect(() => {
        const createWidget = () => {
            if (containerRef.current && typeof TradingView !== 'undefined') {
                const widgetOptions = {
                    autosize: true,
                    symbol: symbol,
                    interval: interval,
                    timezone: "Etc/UTC",
                    theme: "dark",
                    style: "1",
                    locale: "ar_AE",
                    toolbar_bg: "#f1f3f6",
                    enable_publishing: false,
                    withdateranges: true,
                    hide_side_toolbar: false,
                    allow_symbol_change: false,
                    container_id: containerRef.current.id,
                };

                const widget = new TradingView.widget(widgetOptions);
                widgetRef.current = widget;
            }
        };

        if (!widgetRef.current) {
             // Ensure the script is loaded before creating the widget
            if (typeof TradingView !== 'undefined') {
                 createWidget();
            } else {
                // If script is not loaded yet, wait for it
                const script = document.querySelector('script[src*="tv.js"]');
                if (script) {
                    script.addEventListener('load', createWidget);
                    return () => script.removeEventListener('load', createWidget);
                }
            }
        } else {
             // If widget already exists, just update the symbol
             widgetRef.current.onready(() => {
                widgetRef.current.setSymbol(symbol, interval, () => {});
            });
        }

    }, [symbol, interval]);

    return <div id="tradingview_widget_container" ref={containerRef} className="w-full h-full" />;
};

export default TradingViewWidget;
