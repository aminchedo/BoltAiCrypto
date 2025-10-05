// src/services/agent.ts
import { api } from './api';

export interface AgentStatus {
  enabled: boolean;
  scan_interval_ms: number;
  subscribed_symbols: string[];
}

export interface AgentConfig {
  scan_interval_ms: number;
  max_symbols: number;
  supported_timeframes: string[];
}

/**
 * Get current agent status
 */
export async function getAgentStatus(): Promise<AgentStatus> {
  const response = await api.get<AgentStatus>('/api/agent/status');
  return response;
}

/**
 * Toggle agent on/off
 */
export async function toggleAgent(enabled: boolean): Promise<AgentStatus> {
  const response = await api.put<AgentStatus>(`/api/agent/toggle?enabled=${enabled}`);
  return response;
}

/**
 * Subscribe to symbols for real-time updates
 */
export async function subscribeSymbols(symbols: string[]): Promise<{ status: string; subscribed_symbols: string[] }> {
  const response = await api.post<{ status: string; subscribed_symbols: string[] }>(
    '/api/agent/subscribe',
    { symbols }
  );
  return response;
}

/**
 * Get agent configuration
 */
export async function getAgentConfig(): Promise<AgentConfig> {
  const response = await api.get<AgentConfig>('/api/agent/config');
  return response;
}

/**
 * Update agent configuration
 */
export async function updateAgentConfig(scanIntervalMs?: number): Promise<{ status: string; scan_interval_ms: number }> {
  const params = scanIntervalMs ? `?scan_interval_ms=${scanIntervalMs}` : '';
  const response = await api.put<{ status: string; scan_interval_ms: number }>(
    `/api/agent/config${params}`
  );
  return response;
}
