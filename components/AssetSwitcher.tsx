import React from 'react';
import { Asset, Timeframe } from '../types';
import { ASSET_DETAILS } from '../constants';

interface AssetSwitcherProps {
    activeAsset: Asset;
    onSelectAsset: (asset: Asset) => void;
}

const AssetSwitcher: React.FC<AssetSwitcherProps> = ({ activeAsset, onSelectAsset }) => {
    const assets = Object.keys(ASSET_DETAILS) as Asset[];

    return (
        <div className="flex items-center justify-center space-x-2 space-x-reverse bg-slate-800 p-1 rounded-lg shadow-md">
            {assets.map((asset) => {
                const details = ASSET_DETAILS[asset];
                const isActive = activeAsset === asset;
                return (
                    <button
                        key={asset}
                        onClick={() => onSelectAsset(asset)}
                        className={`w-full px-4 py-2 text-md font-bold rounded-md transition-all duration-300 transform focus:outline-none ${
                            isActive
                                ? `${details.accentBgClass} text-slate-900 shadow-lg scale-105`
                                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                    >
                        {details.name} ({details.symbol})
                    </button>
                )
            })}
        </div>
    );
};

export default AssetSwitcher;
