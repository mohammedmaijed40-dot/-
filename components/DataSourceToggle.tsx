import React from 'react';

type DataSource = 'live' | 'simulation';

interface DataSourceToggleProps {
    dataSource: DataSource;
    onDataSourceChange: (source: DataSource) => void;
}

const DataSourceToggle: React.FC<DataSourceToggleProps> = ({ dataSource, onDataSourceChange }) => {
    return (
        <div className="flex items-center p-1 rounded-lg bg-slate-800">
            <button
                onClick={() => onDataSourceChange('live')}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors w-28 ${
                    dataSource === 'live'
                    ? 'bg-cyan-500 text-slate-900 shadow-md'
                    : 'bg-transparent text-slate-400 hover:bg-slate-700'
                }`}
            >
                🚀 بث حي
            </button>
             <button
                onClick={() => onDataSourceChange('simulation')}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors w-28 ${
                    dataSource === 'simulation'
                    ? 'bg-purple-500 text-slate-900 shadow-md'
                    : 'bg-transparent text-slate-400 hover:bg-slate-700'
                }`}
            >
                ⚙️ محاكاة
            </button>
        </div>
    );
};

export default DataSourceToggle;
