import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { WebSocketManager, ConnectionState } from '../../services/websocket';

interface WSStatusBadgeProps {
  wsManager: WebSocketManager;
}

export default function WSStatusBadge({ wsManager }: WSStatusBadgeProps) {
  const [status, setStatus] = useState<ConnectionState>('disconnected');

  useEffect(() => {
    const unsubscribe = wsManager.onStateChange((newState) => {
      setStatus(newState);
    });

    return unsubscribe;
  }, [wsManager]);

  const statusConfig = {
    connected: {
      label: 'CONNECTED',
      labelAr: 'متصل',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-400/50',
      icon: Wifi
    },
    connecting: {
      label: 'CONNECTING',
      labelAr: 'در حال اتصال',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-400/50',
      icon: Loader2
    },
    disconnected: {
      label: 'DISCONNECTED',
      labelAr: 'قطع شده',
      color: 'text-slate-400',
      bgColor: 'bg-slate-700/40',
      borderColor: 'border-slate-500/50',
      icon: WifiOff
    },
    reconnecting: {
      label: 'RECONNECTING',
      labelAr: 'اتصال مجدد',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-400/50',
      icon: Loader2
    },
    error: {
      label: 'ERROR',
      labelAr: 'خطا',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-400/50',
      icon: WifiOff
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div 
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl
        ${config.bgColor} ${config.borderColor} transition-all duration-300
      `}
      title={`WebSocket Status: ${config.label}`}
    >
      <Icon 
        className={`
          w-4 h-4 ${config.color}
          ${(status === 'connecting' || status === 'reconnecting') ? 'animate-spin' : ''}
        `} 
      />
      <span className={`text-xs font-medium ${config.color} hidden sm:inline ltr-numbers`}>
        WS: {config.label}
      </span>
      <span className={`text-xs font-medium ${config.color} sm:hidden`}>
        {status === 'connected' ? '●' : status === 'disconnected' ? '○' : '◐'}
      </span>
    </div>
  );
}
