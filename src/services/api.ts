const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export class ApiService {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }

  async getPrice(symbol: string) {
    return this.get(`/api/price/${symbol}`);
  }

  async generateSignal(symbol: string, interval: string = '1h') {
    return this.post('/api/signals/generate', { symbol, interval });
  }

  async getLiveSignals() {
    return this.get('/api/signals/live');
  }

  async getAnalysis(symbol: string) {
    return this.get(`/api/analysis/${symbol}`);
  }

  async updateRiskSettings(settings: any) {
    return this.post('/settings/risk', settings);
  }

  async getSettings() {
    return this.get('/settings');
  }

  async getHealth() {
    return this.get('/health');
  }

  async getKuCoinPrice(symbol: string) {
    return this.get(`/api/kucoin/price/${symbol}`);
  }

  async getKuCoinOHLCV(symbol: string, interval: string = '1hour', limit: number = 100) {
    return this.get(`/api/kucoin/ohlcv/${symbol}?interval=${interval}&limit=${limit}`);
  }

  async getKuCoinTicker(symbol: string) {
    return this.get(`/api/kucoin/ticker/${symbol}`);
  }

  async getAllApisHealth() {
    return this.get('/api/health/all-apis');
  }

  async getServiceHealth(serviceName: string) {
    return this.get(`/api/health/${serviceName}`);
  }

  async forceApiFailover(service: string) {
    return this.post(`/api/fallback/force/${service}`, {});
  }

  async getApiEndpoints() {
    return this.get('/api/config/endpoints');
  }
}

export const apiService = new ApiService();