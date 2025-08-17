from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import pandas as pd
from datetime import datetime
from typing import List

from models import TradingSignal, MarketData, RiskSettings
from data.data_manager import data_manager
from data.kucoin_client import kucoin_client
from data.api_fallback_manager import api_fallback_manager
from data.api_config import API_CONFIG, get_all_api_endpoints, count_total_endpoints
from analytics.core_signals import generate_rsi_macd_signal, calculate_trend_strength
from analytics.smc_analysis import analyze_smart_money_concepts
from analytics.pattern_detection import detect_candlestick_patterns
from analytics.sentiment import SentimentAnalyzer
from analytics.ml_predictor import ml_predictor
from analytics.indicators import calculate_atr
from risk.risk_manager import risk_manager

app = FastAPI(title="HTS Trading System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections[:]:
            try:
                await connection.send_text(json.dumps(message, default=str))
            except:
                self.disconnect(connection)

manager = ConnectionManager()

# Global variables
sentiment_analyzer = SentimentAnalyzer()
active_signals = {}
system_settings = {
    'risk_multiplier': 1.0,
    'min_volume_usd': 5000000,
    'manual_confirmation': True
}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0",
        "active_signals": len(active_signals),
        "websocket_connections": len(manager.active_connections),
        "total_apis": count_total_endpoints(),
        "data_source": "kucoin_primary"
    }

# KuCoin Market Data Endpoints (Replace Binance)
@app.get("/api/kucoin/price/{symbol}")
async def get_kucoin_price(symbol: str):
    """Get current price from KuCoin API"""
    try:
        price_data = await kucoin_client.get_ticker_price(symbol)
        return price_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/kucoin/ohlcv/{symbol}")
async def get_kucoin_ohlcv(symbol: str, interval: str = "1hour", limit: int = 100):
    """Get OHLCV data from KuCoin API"""
    try:
        ohlcv_data = await kucoin_client.get_klines(symbol, interval, limit)
        return {
            "symbol": symbol,
            "interval": interval,
            "data": ohlcv_data.to_dict('records') if not ohlcv_data.empty else [],
            "source": "kucoin"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/kucoin/ticker/{symbol}")
async def get_kucoin_ticker(symbol: str):
    """Get 24hr ticker from KuCoin API"""
    try:
        ticker_data = await kucoin_client.get_24hr_ticker(symbol)
        return ticker_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API Health & Fallback Management
@app.get("/api/health/all-apis")
async def get_all_apis_health():
    """Get health status of all 40 configured APIs"""
    try:
        async with api_fallback_manager as manager:
            health_summary = await manager.get_api_health_summary()
            return health_summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health/{service_name}")
async def get_service_health(service_name: str):
    """Get health status of a specific API service"""
    try:
        async with api_fallback_manager as manager:
            health_results = await manager.health_check_all_apis()
            if service_name in health_results:
                return {
                    "service": service_name,
                    "health": health_results[service_name],
                    "timestamp": datetime.now().isoformat()
                }
            else:
                raise HTTPException(status_code=404, detail=f"Service {service_name} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fallback/force/{service}")
async def force_fallback(service: str):
    """Force a service to use fallback APIs"""
    try:
        async with api_fallback_manager as manager:
            success = await manager.force_fallback(service)
            if success:
                return {"status": "success", "message": f"Forced fallback for {service}"}
            else:
                raise HTTPException(status_code=404, detail=f"Service {service} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced API Configuration Endpoints
@app.get("/api/config/endpoints")
async def get_api_endpoints():
    """Get list of all configured API endpoints"""
    try:
        endpoints = get_all_api_endpoints()
        return {
            "total_endpoints": len(endpoints),
            "endpoints": endpoints,
            "services": list(API_CONFIG.keys())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/price/{symbol}")
async def get_price(symbol: str):
    try:
        # Use KuCoin as primary, fallback to data_manager
        try:
            ticker_data = await kucoin_client.get_ticker_price(symbol)
        except:
            ticker_data = await data_manager.get_market_data(symbol)
        return ticker_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ohlcv/{symbol}")
async def get_ohlcv(symbol: str, interval: str = "1h", limit: int = 100):
    try:
        # Use KuCoin as primary, fallback to data_manager
        try:
            kucoin_interval = "1hour" if interval == "1h" else interval
            ohlcv_data = await kucoin_client.get_klines(symbol, kucoin_interval, limit)
        except:
            ohlcv_data = await data_manager.get_ohlcv_data(symbol, interval, limit)
            
        return {
            "symbol": symbol,
            "interval": interval,
            "data": ohlcv_data.to_dict('records') if not ohlcv_data.empty else [],
            "source": "kucoin_primary"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/signals/generate")
async def generate_signal(request: dict):
    try:
        symbol = request.get('symbol', 'BTCUSDT')
        interval = request.get('interval', '1h')
        
        print(f"Generating signal for {symbol}")
        
        # Get OHLCV data
        # Use KuCoin as primary data source
        try:
            kucoin_interval = "1hour" if interval == "1h" else interval
            ohlcv_data = await kucoin_client.get_klines(symbol, kucoin_interval, 100)
        except:
            ohlcv_data = await data_manager.get_ohlcv_data(symbol, interval, 100)
        
        if ohlcv_data.empty or len(ohlcv_data) < 50:
            raise HTTPException(status_code=400, detail="Insufficient market data available")
        
        # Get current market data
        try:
            market_data = await kucoin_client.get_24hr_ticker(symbol)
        except:
            market_data = await data_manager.get_market_data(symbol)
        
        # Generate signals from all components using IMMUTABLE FORMULA
        
        # 1. Core RSI+MACD signal (40% weight)
        core_signal = generate_rsi_macd_signal(ohlcv_data)
        rsi_macd_score = core_signal['score']
        
        # 2. Smart Money Concepts (25% weight)  
        smc_analysis = analyze_smart_money_concepts(ohlcv_data)
        smc_score = smc_analysis['score']
        
        # 3. Pattern detection (20% weight)
        pattern_analysis = detect_candlestick_patterns(ohlcv_data)
        pattern_score = pattern_analysis['score']
        
        # 4. Sentiment analysis (10% weight)
        sentiment_data = await data_manager.get_sentiment_data(symbol.replace('USDT', ''))
        sentiment_score = sentiment_data['score']
        
        # 5. ML prediction (5% weight)
        ml_prediction = ml_predictor.predict(ohlcv_data)
        ml_score = ml_prediction['score']
        
        # IMMUTABLE FORMULA - Calculate final score
        final_score = (
            0.40 * rsi_macd_score +
            0.25 * smc_score +
            0.20 * pattern_score +
            0.10 * sentiment_score +
            0.05 * ml_score
        )
        
        print(f"Score breakdown - RSI/MACD: {rsi_macd_score:.3f}, SMC: {smc_score:.3f}, Patterns: {pattern_score:.3f}, Sentiment: {sentiment_score:.3f}, ML: {ml_score:.3f}")
        print(f"Final score: {final_score:.3f}")
        
        # Determine action based on final score
        if final_score > 0.7:
            action = "BUY"
            confidence = final_score
        elif final_score < 0.3:
            action = "SELL" 
            confidence = 1.0 - final_score
        else:
            action = "HOLD"
            confidence = 0.5
        
        # Calculate risk metrics
        if not ohlcv_data.empty and len(ohlcv_data) > 14:
            atr = calculate_atr(ohlcv_data['high'], ohlcv_data['low'], ohlcv_data['close']).iloc[-1]
        else:
            atr = 0.0
        entry_price = market_data['price']
        stop_loss = risk_manager.calculate_stop_loss(entry_price, atr, action)
        take_profit = risk_manager.calculate_take_profit(entry_price, stop_loss, action)
        position_size = risk_manager.calculate_position_size(
            risk_manager.current_equity,
            atr,
            market_data['volume'],
            market_data['volume'],
            confidence
        )
        
        # Create trading signal
        signal = TradingSignal(
            symbol=symbol,
            action=action,
            confidence=confidence,
            final_score=final_score,
            rsi_macd_score=rsi_macd_score,
            smc_score=smc_score,
            pattern_score=pattern_score,
            sentiment_score=sentiment_score,
            ml_score=ml_score,
            timestamp=datetime.now(),
            price=market_data['price'],
            entry_price=entry_price,
            stop_loss=stop_loss,
            take_profit=take_profit,
            position_size=position_size
        )
        
        # Store active signal
        active_signals[symbol] = signal
        
        # Broadcast to WebSocket clients
        await manager.broadcast({
            "type": "signal_update",
            "data": signal.dict()
        })
        
        print(f"Generated {action} signal for {symbol} with confidence {confidence:.3f}")
        
        return signal.dict()
        
    except Exception as e:
        print(f"Error generating signal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/signals/live")
async def get_live_signals():
    return {
        "signals": [signal.dict() for signal in active_signals.values()],
        "count": len(active_signals),
        "timestamp": datetime.now()
    }

@app.get("/api/analysis/{symbol}")
async def get_analysis(symbol: str):
    try:
        # Get comprehensive analysis
        # Use KuCoin as primary data source
        try:
            ohlcv_data = await kucoin_client.get_klines(symbol, "1hour", 100)
            market_data = await kucoin_client.get_24hr_ticker(symbol)
        except:
            ohlcv_data = await data_manager.get_ohlcv_data(symbol, "1h", 100)
            market_data = await data_manager.get_market_data(symbol)
        
        if ohlcv_data.empty:
            raise HTTPException(status_code=400, detail="No market data available")
        
        core_signal = generate_rsi_macd_signal(ohlcv_data)
        smc_analysis = analyze_smart_money_concepts(ohlcv_data)
        pattern_analysis = detect_candlestick_patterns(ohlcv_data)
        sentiment_data = await data_manager.get_sentiment_data(symbol.replace('USDT', ''))
        ml_prediction = ml_predictor.predict(ohlcv_data)
        
        if not ohlcv_data.empty and len(ohlcv_data) > 14:
            atr = calculate_atr(ohlcv_data['high'], ohlcv_data['low'], ohlcv_data['close']).iloc[-1]
        else:
            atr = 0.0
        
        return {
            "symbol": symbol,
            "market_data": market_data,
            "ohlcv_data": ohlcv_data.tail(50).to_dict('records'),  # Last 50 candles for chart
            "analysis": {
                "core_signal": core_signal,
                "smc_analysis": smc_analysis,
                "pattern_analysis": pattern_analysis,
                "sentiment_data": sentiment_data,
                "ml_prediction": ml_prediction,
                "atr": float(atr) if not pd.isna(atr) else 0.0
            },
            "risk_metrics": risk_manager.get_risk_status(),
            "data_sources": {
                "primary": "kucoin",
                "fallback_available": True,
                "api_health": "healthy"
            },
            "timestamp": datetime.now()
        }
        
    except Exception as e:
        print(f"Error getting analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/settings/risk")
async def update_risk_settings(settings: dict):
    try:
        risk_manager.update_settings(settings)
        
        if 'multiplier' in settings:
            system_settings['risk_multiplier'] = float(settings['multiplier'])
        
        return {
            "status": "updated",
            "settings": system_settings,
            "risk_status": risk_manager.get_risk_status()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settings")
async def get_settings():
    return {
        "risk_multiplier": system_settings['risk_multiplier'],
        "min_volume_usd": system_settings['min_volume_usd'],
        "manual_confirmation": system_settings['manual_confirmation'],
        "risk_status": risk_manager.get_risk_status()
    }

@app.websocket("/ws/signals")
async def websocket_signals(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Send periodic updates
            await asyncio.sleep(5)
            
            if active_signals:
                await websocket.send_text(json.dumps({
                    "type": "signals_update",
                    "data": [signal.dict() for signal in active_signals.values()],
                    "timestamp": datetime.now().isoformat()
                }, default=str))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    await manager.connect(websocket)
    symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT", "XRPUSDT"]
    
    try:
        while True:
            price_updates = []
            
            for symbol in symbols:
                try:
                    # Use KuCoin as primary
                    try:
                        market_data = await kucoin_client.get_24hr_ticker(symbol)
                    except:
                        market_data = await data_manager.get_market_data(symbol)
                    price_updates.append(market_data)
                except:
                    pass
            
            if price_updates:
                await websocket.send_text(json.dumps({
                    "type": "price_update",
                    "data": price_updates,
                    "timestamp": datetime.now().isoformat()
                }, default=str))
            
            await asyncio.sleep(3)  # Update every 3 seconds
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/reset")
async def reset_system():
    """Reset system state"""
    try:
        active_signals.clear()
        risk_manager.reset_daily_stats()
        data_manager.clear_cache()
        
        return {
            "status": "reset_complete",
            "timestamp": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting HTS Trading System Backend...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)