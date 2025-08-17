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
}

export const apiService = new ApiService();