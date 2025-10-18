import React, { useState } from 'react';
import ChartContainer from './components/ChartContainer';
import AssetSwitcher from './components/AssetSwitcher';
import { Asset } from './types';
import { ASSET_DETAILS } from './constants';

const App: React.FC = () => {
  const [activeAsset, setActiveAsset] = useState<Asset>('GC');
  const assetDetails = ASSET_DETAILS[activeAsset];

  const backgroundStyle = {
    // #0f172a is slate-900. The gradient provides a glow at the top.
    background: `radial-gradient(ellipse 50% 50% at 50% -10%, ${assetDetails.glowColor}, rgba(15, 23, 42, 0)), #0f172a`
  };

  return (
    <div 
      className="min-h-screen text-gray-200 p-2 sm:p-4 md:p-6 transition-all duration-700"
      style={backgroundStyle}
    >
      <main className="container mx-auto">
        <div className="mb-4">
          <AssetSwitcher
            activeAsset={activeAsset}
            onSelectAsset={setActiveAsset}
          />
        </div>
        <ChartContainer key={activeAsset} asset={activeAsset} />
      </main>
      <footer className="text-center text-xs text-slate-500 mt-8">
        <p>البيانات والرسوم البيانية مقدمة بواسطة TradingView.</p>
        <p>Data and charts are provided by TradingView.</p>
      </footer>
    </div>
  );
};

export default App;