import React, { useEffect, useState } from 'react';
import { Zap, ZapOff } from 'lucide-react';
import { getAgentStatus, toggleAgent, subscribeSymbols } from '../../services/agent';
import { WebSocketManager } from '../../services/websocket';

interface AgentToggleProps {
  wsManager?: WebSocketManager;
  watchlistSymbols?: string[];
}

export default function AgentToggle({ 
  wsManager, 
  watchlistSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'] 
}: AgentToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial status
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const status = await getAgentStatus();
      setEnabled(status.enabled);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load agent status:', err);
      setError('Failed to load status');
    }
  };

  const handleToggle = async () => {
    setLoading(true);
    setError(null);

    try {
      const nextState = !enabled;
      const status = await toggleAgent(nextState);
      setEnabled(status.enabled);

      if (status.enabled) {
        // Connect WebSocket when agent is enabled
        if (wsManager) {
          wsManager.connect();
          
          // Wait a moment for connection to establish
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Subscribe to symbols
        await subscribeSymbols(watchlistSymbols);
        
        // Send subscription message via WebSocket
        if (wsManager) {
          wsManager.send({
            action: 'subscribe',
            symbols: watchlistSymbols
          });
        }
      } else {
        // Disconnect WebSocket when agent is disabled
        if (wsManager) {
          wsManager.disconnect();
        }
      }
    } catch (err: any) {
      console.error('Failed to toggle agent:', err);
      setError(err.message || 'Toggle failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-xl
          transition-all duration-300 font-medium
          ${enabled 
            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30' 
            : 'bg-slate-700/40 border-slate-500/50 text-slate-300 hover:bg-slate-700/60'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-pressed={enabled}
        title={enabled ? 'Real-Time Agent is ON' : 'Real-Time Agent is OFF'}
      >
        {enabled ? (
          <>
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Agent: ON</span>
            <span className="sm:hidden">ON</span>
          </>
        ) : (
          <>
            <ZapOff className="w-4 h-4" />
            <span className="hidden sm:inline">Agent: OFF</span>
            <span className="sm:hidden">OFF</span>
          </>
        )}
      </button>
      
      {error && (
        <span className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
