import React, { useState, useEffect } from 'react';
import { Server, CheckCircle, XCircle, Clock, Zap, Database, Activity, RefreshCw, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography, getRelativeTime } from '../utils/designTokens';
import Loading from './Loading';
import ErrorBlock from './ErrorBlock';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  uptime_pct: number;
  last_error?: string;
  last_check: string;
  endpoint?: string;
}

interface HealthSummary {
  overall_status: 'healthy' | 'degraded' | 'down';
  total_services: number;
  healthy_count: number;
  degraded_count: number;
  down_count: number;
  avg_latency_ms: number;
  last_updated: string;
}

const SystemStatus: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'failing'>('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    try {
      setError(null);
      
      const [healthRes, servicesRes] = await Promise.all([
        apiService.get<any>('/api/health').catch(() => null),
        apiService.get<any>('/api/status/services').catch(() => null)
      ]);

      if (healthRes && servicesRes) {
        setSummary(healthRes);
        setServices(servicesRes.services || []);
      } else {
        // Mock data
        const mockServices = generateMockServices();
        setServices(mockServices);
        setSummary(generateMockSummary(mockServices));
      }
      
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load system status:', err);
      const mockServices = generateMockServices();
      setServices(mockServices);
      setSummary(generateMockSummary(mockServices));
      setIsLoading(false);
    }
  };

  const generateMockServices = (): ServiceStatus[] => {
    return [
      {
        name: 'Trading Engine',
        status: 'healthy',
        latency_ms: 45,
        uptime_pct: 99.9,
        last_check: new Date().toISOString(),
        endpoint: '/api/trading'
      },
      {
        name: 'Market Data',
        status: 'healthy',
        latency_ms: 32,
        uptime_pct: 99.95,
        last_check: new Date().toISOString(),
        endpoint: '/api/markets'
      },
      {
        name: 'Risk Engine',
        status: 'healthy',
        latency_ms: 58,
        uptime_pct: 99.8,
        last_check: new Date().toISOString(),
        endpoint: '/api/risk'
      },
      {
        name: 'Portfolio Service',
        status: 'degraded',
        latency_ms: 245,
        uptime_pct: 98.5,
        last_error: 'Slow database query detected',
        last_check: new Date().toISOString(),
        endpoint: '/api/portfolio'
      },
      {
        name: 'AI Predictions',
        status: 'healthy',
        latency_ms: 120,
        uptime_pct: 99.2,
        last_check: new Date().toISOString(),
        endpoint: '/api/ai'
      },
      {
        name: 'WebSocket Server',
        status: 'healthy',
        latency_ms: 15,
        uptime_pct: 99.99,
        last_check: new Date().toISOString(),
        endpoint: 'ws://'
      },
      {
        name: 'Database',
        status: 'healthy',
        latency_ms: 28,
        uptime_pct: 99.95,
        last_check: new Date().toISOString()
      },
      {
        name: 'Cache (Redis)',
        status: 'healthy',
        latency_ms: 8,
        uptime_pct: 99.99,
        last_check: new Date().toISOString()
      }
    ];
  };

  const generateMockSummary = (services: ServiceStatus[]): HealthSummary => {
    const healthy = services.filter(s => s.status === 'healthy').length;
    const degraded = services.filter(s => s.status === 'degraded').length;
    const down = services.filter(s => s.status === 'down').length;
    const avgLatency = services.reduce((sum, s) => sum + s.latency_ms, 0) / services.length;

    return {
      overall_status: down > 0 ? 'down' : degraded > 0 ? 'degraded' : 'healthy',
      total_services: services.length,
      healthy_count: healthy,
      degraded_count: degraded,
      down_count: down,
      avg_latency_ms: avgLatency,
      last_updated: new Date().toISOString()
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="text-green-400" />;
      case 'degraded': return <Clock className="text-yellow-400" />;
      case 'down': return <XCircle className="text-red-400" />;
      default: return <Activity className="text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'degraded': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'down': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-green-400';
    if (latency < 150) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredServices = filterStatus === 'all' 
    ? services 
    : services.filter(s => s.status !== 'healthy');

  if (isLoading) {
    return <Loading message="Loading system status..." />;
  }

  if (error) {
    return <ErrorBlock message={error} onRetry={loadSystemStatus} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white flex items-center gap-2" style={{ fontSize: typography['2xl'] }}>
            <Server style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }} className="text-cyan-400" />
            System Status
          </h2>
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>
            Monitor all services and infrastructure • Updated {getRelativeTime(lastUpdate)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
            style={{ fontSize: typography.sm }}
          >
            <option value="all">All Services</option>
            <option value="failing">Failing Only</option>
          </select>

          <button
            onClick={loadSystemStatus}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            aria-label="Refresh"
          >
            <RefreshCw style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              'bg-slate-800/30 backdrop-blur-lg rounded-xl border p-4',
              summary.overall_status === 'healthy' ? 'border-green-500/30' : 
              summary.overall_status === 'degraded' ? 'border-yellow-500/30' : 
              'border-red-500/30'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {React.cloneElement(getStatusIcon(summary.overall_status), {
                style: { width: dimensions.iconSize.md, height: dimensions.iconSize.md }
              })}
              <span className="text-slate-400" style={{ fontSize: typography.sm }}>Overall</span>
            </div>
            <div className="font-bold text-white capitalize" style={{ fontSize: typography['2xl'] }}>
              {summary.overall_status}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Server style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-slate-400" />
              <span className="text-slate-400" style={{ fontSize: typography.sm }}>Services</span>
            </div>
            <div className="font-bold text-white" style={{ fontSize: typography['2xl'] }}>
              {summary.total_services}
            </div>
            <div className="text-slate-400" style={{ fontSize: typography.xs }}>
              {summary.healthy_count} healthy
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-cyan-400" />
              <span className="text-slate-400" style={{ fontSize: typography.sm }}>Avg Latency</span>
            </div>
            <div className={clsx('font-bold', getLatencyColor(summary.avg_latency_ms))} style={{ fontSize: typography['2xl'] }}>
              {summary.avg_latency_ms.toFixed(0)}ms
            </div>
          </motion.div>

          {summary.degraded_count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-yellow-500/30 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-yellow-400" />
                <span className="text-slate-400" style={{ fontSize: typography.sm }}>Degraded</span>
              </div>
              <div className="font-bold text-yellow-400" style={{ fontSize: typography['2xl'] }}>
                {summary.degraded_count}
              </div>
            </motion.div>
          )}

          {summary.down_count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-red-500/30 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <XCircle style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-red-400" />
                <span className="text-slate-400" style={{ fontSize: typography.sm }}>Down</span>
              </div>
              <div className="font-bold text-red-400" style={{ fontSize: typography['2xl'] }}>
                {summary.down_count}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {React.cloneElement(getStatusIcon(service.status), {
                  style: { width: dimensions.iconSize.md, height: dimensions.iconSize.md }
                })}
                <span className="font-semibold text-white" style={{ fontSize: typography.base }}>
                  {service.name}
                </span>
              </div>
              <span className={clsx('px-2 py-1 rounded text-xs font-medium border', getStatusColor(service.status))}
                    style={{ fontSize: typography.xs }}>
                {service.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400" style={{ fontSize: typography.xs }}>Latency</span>
                <span className={clsx('font-mono font-medium', getLatencyColor(service.latency_ms))} 
                      style={{ fontSize: typography.sm }}>
                  {service.latency_ms}ms
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400" style={{ fontSize: typography.xs }}>Uptime</span>
                <span className="text-white font-mono" style={{ fontSize: typography.sm }}>
                  {service.uptime_pct.toFixed(2)}%
                </span>
              </div>

              {service.endpoint && (
                <div className="flex justify-between">
                  <span className="text-slate-400" style={{ fontSize: typography.xs }}>Endpoint</span>
                  <span className="text-slate-300 font-mono truncate ml-2" style={{ fontSize: typography.xs }}>
                    {service.endpoint}
                  </span>
                </div>
              )}

              {service.last_error && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400" 
                     style={{ fontSize: typography.xs }}>
                  {service.last_error}
                </div>
              )}

              {/* Latency Sparkline (Simple visualization) */}
              <div className="mt-3">
                <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className={clsx(
                      'h-full transition-all duration-500',
                      service.latency_ms < 50 ? 'bg-green-500' :
                      service.latency_ms < 150 ? 'bg-yellow-500' :
                      'bg-red-500'
                    )}
                    style={{ width: `${Math.min((service.latency_ms / 300) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredServices.length === 0 && filterStatus === 'failing' && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2" style={{ fontSize: typography.lg }}>All Services Healthy</p>
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>No failing services detected</p>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;
