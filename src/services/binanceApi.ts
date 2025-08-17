export class BinanceAPI {
  private baseUrl = 'https://api.binance.com';
  private testnetUrl = 'https://testnet.binance.vision';
  private useTestnet = false;

  constructor(useTestnet = false) {
    this.useTestnet = useTestnet;
  }

  private getBaseUrl() {
    return this.useTestnet ? this.testnetUrl : this.baseUrl;
  }

  async getTickerPrice(symbol: string): Promise<{ symbol: string; price: number; timestamp: Date }> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/v3/ticker/price?symbol=${symbol}`);
      const data = await response.json();
      
      return {
        symbol: data.symbol,
        price: parseFloat(data.price),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching ticker price:', error);
      throw error;
    }
  }

  async get24hrTicker(symbol: string): Promise<any> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/api/v3/ticker/24hr?symbol=${symbol}`);
      const data = await response.json();
      
      return {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        volume: parseFloat(data.volume),
        high_24h: parseFloat(data.highPrice),
        low_24h: parseFloat(data.lowPrice),
        change_24h: parseFloat(data.priceChangePercent),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching 24hr ticker:', error);
      throw error;
    }
  }

  async getKlines(symbol: string, interval: string = '1h', limit: number = 100): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.getBaseUrl()}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      const data = await response.json();
      
      return data.map((kline: any[]) => ({
        timestamp: new Date(kline[0]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5])
      }));
    } catch (error) {
      console.error('Error fetching klines:', error);
      return [];
    }
  }
}

export const binanceApi = new BinanceAPI(false);