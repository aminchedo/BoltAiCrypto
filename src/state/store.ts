/**
 * Lightweight Observable Store
 * Simple state management for scanner configuration
 */

export interface WeightConfig {
  harmonic: number;
  elliott: number;
  smc: number;
  fibonacci: number;
  price_action: number;
  sar: number;
  sentiment: number;
  news: number;
  whales: number;
}

export interface ScanRules {
  any_tf: number;      // Min score for any single timeframe
  majority_tf: number; // Min score for majority of timeframes
  mode: 'aggressive' | 'conservative';
}

export interface AppState {
  symbols: string[];
  timeframes: string[];
  weights: WeightConfig;
  rules: ScanRules;
}

type Listener = (state: AppState) => void;

class Store {
  private state: AppState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    // Default state
    this.state = {
      symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT'],
      timeframes: ['15m', '1h', '4h'],
      weights: {
        harmonic: 0.15,
        elliott: 0.15,
        smc: 0.20,
        fibonacci: 0.10,
        price_action: 0.15,
        sar: 0.10,
        sentiment: 0.10,
        news: 0.05,
        whales: 0.05
      },
      rules: {
        any_tf: 0.6,
        majority_tf: 0.7,
        mode: 'conservative'
      }
    };

    // Load persisted state from localStorage
    this.loadFromLocalStorage();
  }

  /**
   * Get current state
   */
  getState(): AppState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<AppState>): void {
    this.state = { ...this.state, ...updates };
    this.persistToLocalStorage();
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Persist state to localStorage
   */
  private persistToLocalStorage(): void {
    try {
      localStorage.setItem('hts_scanner_state', JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to persist state to localStorage:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('hts_scanner_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = { ...this.state, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
  }

  // ==================== Public Actions ====================

  /**
   * Set symbols to scan
   */
  setSymbols(symbols: string[]): void {
    if (symbols.length === 0) {
      console.warn('Cannot set empty symbols array');
      return;
    }
    this.setState({ symbols });
  }

  /**
   * Add a symbol
   */
  addSymbol(symbol: string): void {
    if (this.state.symbols.includes(symbol)) return;
    this.setState({ symbols: [...this.state.symbols, symbol] });
  }

  /**
   * Remove a symbol
   */
  removeSymbol(symbol: string): void {
    const symbols = this.state.symbols.filter(s => s !== symbol);
    if (symbols.length === 0) {
      console.warn('Cannot remove last symbol');
      return;
    }
    this.setState({ symbols });
  }

  /**
   * Set timeframes
   */
  setTimeframes(timeframes: string[]): void {
    if (timeframes.length === 0) {
      console.warn('Cannot set empty timeframes array');
      return;
    }
    this.setState({ timeframes });
  }

  /**
   * Update detector weights
   */
  setWeights(weights: Partial<WeightConfig>): void {
    const updated = { ...this.state.weights, ...weights };
    
    // Validate weights sum to 1.0 (within tolerance)
    const sum = Object.values(updated).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      console.warn(`Weights must sum to 1.0, got ${sum.toFixed(3)}. Auto-normalizing...`);
      // Auto-normalize
      const factor = 1.0 / sum;
      Object.keys(updated).forEach(key => {
        updated[key as keyof WeightConfig] *= factor;
      });
    }
    
    this.setState({ weights: updated });
  }

  /**
   * Update scan rules
   */
  setRules(rules: Partial<ScanRules>): void {
    this.setState({ rules: { ...this.state.rules, ...rules } });
  }

  /**
   * Reset to default state
   */
  reset(): void {
    localStorage.removeItem('hts_scanner_state');
    this.state = {
      symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT'],
      timeframes: ['15m', '1h', '4h'],
      weights: {
        harmonic: 0.15,
        elliott: 0.15,
        smc: 0.20,
        fibonacci: 0.10,
        price_action: 0.15,
        sar: 0.10,
        sentiment: 0.10,
        news: 0.05,
        whales: 0.05
      },
      rules: {
        any_tf: 0.6,
        majority_tf: 0.7,
        mode: 'conservative'
      }
    };
    this.notifyListeners();
  }

  /**
   * Load weights from backend
   */
  async loadWeightsFromBackend(): Promise<void> {
    try {
      const { api } = await import('../services/api');
      const response = await api.get<{ weights: WeightConfig }>('/api/config/weights');
      if (response && response.weights) {
        this.setState({ weights: response.weights });
      }
    } catch (error) {
      console.warn('Failed to load weights from backend:', error);
    }
  }

  /**
   * Save weights to backend
   */
  async saveWeightsToBackend(): Promise<void> {
    try {
      const { api } = await import('../services/api');
      await api.post('/api/config/weights', { weights: this.state.weights });
    } catch (error) {
      console.warn('Failed to save weights to backend:', error);
      throw error;
    }
  }

  /**
   * Load preset: Aggressive
   */
  loadAggressivePreset(): void {
    this.setState({
      weights: {
        harmonic: 0.10,
        elliott: 0.10,
        smc: 0.25,
        fibonacci: 0.10,
        price_action: 0.20,
        sar: 0.10,
        sentiment: 0.05,
        news: 0.05,
        whales: 0.05
      },
      rules: {
        any_tf: 0.5,
        majority_tf: 0.6,
        mode: 'aggressive'
      }
    });
  }

  /**
   * Load preset: Conservative
   */
  loadConservativePreset(): void {
    this.setState({
      weights: {
        harmonic: 0.20,
        elliott: 0.20,
        smc: 0.15,
        fibonacci: 0.15,
        price_action: 0.10,
        sar: 0.10,
        sentiment: 0.05,
        news: 0.03,
        whales: 0.02
      },
      rules: {
        any_tf: 0.7,
        majority_tf: 0.8,
        mode: 'conservative'
      }
    });
  }

  /**
   * Export config as JSON
   */
  exportConfig(): string {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Import config from JSON
   */
  importConfig(json: string): void {
    try {
      const parsed = JSON.parse(json);
      // Validate structure
      if (parsed.weights && parsed.rules && parsed.symbols && parsed.timeframes) {
        this.state = parsed;
        this.persistToLocalStorage();
        this.notifyListeners();
      } else {
        throw new Error('Invalid config structure');
      }
    } catch (error) {
      console.error('Failed to import config:', error);
      throw error;
    }
  }
}

// Singleton instance
export const store = new Store();
