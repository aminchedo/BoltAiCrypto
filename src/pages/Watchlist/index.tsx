import { useState, useEffect } from 'react';
import { Eye, Plus, Trash2, GripVertical } from 'lucide-react';
import { store } from '../../state/store';

export default function Watchlist() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [newSymbol, setNewSymbol] = useState('');

  useEffect(() => {
    const state = store.getState();
    setSymbols(state.symbols);

    const unsubscribe = store.subscribe((state) => {
      setSymbols(state.symbols);
    });

    return unsubscribe;
  }, []);

  const handleAddSymbol = () => {
    if (!newSymbol.trim()) return;
    const symbol = newSymbol.trim().toUpperCase();
    if (!symbols.includes(symbol)) {
      store.addSymbol(symbol);
      setNewSymbol('');
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    store.removeSymbol(symbol);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Watchlist</h1>
            <p className="text-sm text-slate-400">Manage symbols for real-time monitoring</p>
          </div>
        </div>
      </div>

      {/* Add Symbol */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <h2 className="text-lg font-semibold text-white mb-4">Add Symbol</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
            placeholder="Enter symbol (e.g., BTCUSDT)"
            className="flex-1 px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={handleAddSymbol}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Symbols List */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <h2 className="text-lg font-semibold text-white mb-4">
          Watched Symbols <span className="text-slate-400 text-sm ltr-numbers">({symbols.length})</span>
        </h2>
        
        {symbols.length > 0 ? (
          <div className="space-y-2">
            {symbols.map((symbol) => (
              <div
                key={symbol}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-slate-500 cursor-move" />
                  <span className="text-white font-medium">{symbol}</span>
                </div>
                <button
                  onClick={() => handleRemoveSymbol(symbol)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No Symbols in Watchlist</p>
            <p className="text-sm">Add symbols to monitor them in real-time</p>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-6 py-5">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">💡 Tips</h3>
        <ul className="text-sm text-slate-300 space-y-2">
          <li>• Symbols in your watchlist will be monitored when the agent is ON</li>
          <li>• You can drag and drop to reorder symbols</li>
          <li>• Popular symbols: BTCUSDT, ETHUSDT, BNBUSDT, SOLUSDT, ADAUSDT</li>
          <li>• WebSocket subscriptions are automatically managed</li>
        </ul>
      </div>
    </div>
  );
}
