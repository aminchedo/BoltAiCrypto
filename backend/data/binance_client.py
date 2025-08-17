import asyncio
import json
import requests
from datetime import datetime
import pandas as pd

class BinanceClient:
    def __init__(self, testnet=False):
        if testnet:
            self.base_url = "https://testnet.binance.vision"
            self.ws_url = "wss://testnet.binance.vision/ws"
        else:
            self.base_url = "https://api.binance.com"
            self.ws_url = "wss://stream.binance.com:9443/ws"
    
    async def get_ticker_price(self, symbol: str) -> dict:
        """Get current ticker price"""
        try:
            url = f"{self.base_url}/api/v3/ticker/price"
            params = {"symbol": symbol}
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                'symbol': data['symbol'],
                'price': float(data['price']),
                'timestamp': datetime.now()
            }
        except Exception as e:
            print(f"Error fetching ticker price for {symbol}: {e}")
            return {
                'symbol': symbol,
                'price': 0.0,
                'timestamp': datetime.now()
            }
    
    async def get_24hr_ticker(self, symbol: str) -> dict:
        """Get 24hr ticker statistics"""
        try:
            url = f"{self.base_url}/api/v3/ticker/24hr"
            params = {"symbol": symbol}
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                'symbol': data['symbol'],
                'price': float(data['lastPrice']),
                'volume': float(data['volume']),
                'high_24h': float(data['highPrice']),
                'low_24h': float(data['lowPrice']),
                'change_24h': float(data['priceChangePercent']),
                'timestamp': datetime.now()
            }
        except Exception as e:
            print(f"Error fetching 24hr ticker for {symbol}: {e}")
            return {
                'symbol': symbol,
                'price': 0.0,
                'volume': 0.0,
                'high_24h': 0.0,
                'low_24h': 0.0,
                'change_24h': 0.0,
                'timestamp': datetime.now()
            }
    
    async def get_klines(self, symbol: str, interval: str = "1h", limit: int = 100) -> pd.DataFrame:
        """Get candlestick/kline data"""
        try:
            url = f"{self.base_url}/api/v3/klines"
            params = {
                "symbol": symbol,
                "interval": interval,
                "limit": limit
            }
            
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            if not data:
                return pd.DataFrame(columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            
            df = pd.DataFrame(data, columns=[
                'timestamp', 'open', 'high', 'low', 'close', 'volume',
                'close_time', 'quote_asset_volume', 'number_of_trades',
                'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
            ])
            
            # Convert to proper types
            df['open'] = df['open'].astype(float)
            df['high'] = df['high'].astype(float)
            df['low'] = df['low'].astype(float)
            df['close'] = df['close'].astype(float)
            df['volume'] = df['volume'].astype(float)
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            
            return df[['timestamp', 'open', 'high', 'low', 'close', 'volume']]
            
        except Exception as e:
            print(f"Error fetching klines for {symbol}: {e}")
            # Return empty DataFrame with correct structure
            return pd.DataFrame(columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    
    async def get_exchange_info(self) -> dict:
        """Get exchange trading rules and symbol information"""
        try:
            url = f"{self.base_url}/api/v3/exchangeInfo"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching exchange info: {e}")
            return {}

# Global client instance
binance_client = BinanceClient(testnet=False)