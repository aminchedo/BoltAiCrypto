/**
 * Singleton WebSocket Client for HTS Trading System
 * Manages WebSocket connection, subscriptions, and real-time signal streaming
 */

import { WebSocketManager, ConnectionState } from './websocket';

class WSClient {
  private manager: WebSocketManager | null = null;
  private subscribedSymbols: Set<string> = new Set();

  /**
   * Get or create the WebSocket manager instance
   */
  getManager(): WebSocketManager {
    if (!this.manager) {
      this.manager = new WebSocketManager('/ws/realtime', true);
    }
    return this.manager;
  }

  /**
   * Connect to WebSocket
   */
  connect(): void {
    this.getManager().connect();
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.getManager().disconnect();
    this.subscribedSymbols.clear();
  }

  /**
   * Subscribe to symbols for real-time updates
   */
  subscribe(symbols: string[]): void {
    const manager = this.getManager();
    
    // Update subscribed symbols set
    symbols.forEach(symbol => this.subscribedSymbols.add(symbol));

    // Send subscription message
    if (manager.getState() === 'connected') {
      manager.send({
        action: 'subscribe',
        symbols: Array.from(this.subscribedSymbols)
      });
    }
  }

  /**
   * Unsubscribe from symbols
   */
  unsubscribe(symbols: string[]): void {
    const manager = this.getManager();
    
    // Remove from subscribed symbols set
    symbols.forEach(symbol => this.subscribedSymbols.delete(symbol));

    // Send unsubscription message
    if (manager.getState() === 'connected') {
      manager.send({
        action: 'unsubscribe',
        symbols
      });
    }
  }

  /**
   * Get current subscribed symbols
   */
  getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.getManager().getState();
  }

  /**
   * Listen for messages
   */
  onMessage(callback: (event: MessageEvent) => void): () => void {
    return this.getManager().onMessage(callback);
  }

  /**
   * Listen for state changes
   */
  onStateChange(callback: (state: ConnectionState) => void): () => void {
    return this.getManager().onStateChange(callback);
  }
}

// Singleton instance
export const wsClient = new WSClient();
