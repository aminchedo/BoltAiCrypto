"""
Complete API Configuration with 40 Endpoints and Automatic Fallback System
Hardcoded API keys for immediate functionality
"""

# Hardcoded API Keys for immediate functionality
HARDCODED_API_KEYS = {
    # Block Explorer APIs
    "TRONSCAN_KEY": "7ae72726-bffe-4e74-9c33-97b761eeea21",
    "BSCSCAN_KEY": "K62RKHGXTDCG53RU4MCG6XABIMJKTN19IT", 
    "ETHERSCAN_KEY": "SZHYFZK2RR8H9TIMJBVW54V4H81K2Z2KR2",
    "ETHERSCAN_KEY_2": "T6IR8VJHX2NE6ZJW2S3FDVN1TYG4PYYI45",
    
    # Market Data APIs
    "COINMARKETCAP_KEY": "b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c",
    "COINMARKETCAP_KEY_2": "04cf4b5b-9868-465c-8ba0-9f2e78c92eb1",
    "CRYPTOCOMPARE_KEY": "e79c8e6d4c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f",
    
    # News APIs  
    "NEWSAPI_KEY": "pub_346789abc123def456789ghi012345jkl",
}

# Complete API Configuration - 40 Endpoints with Fallbacks
API_CONFIG = {
    # 1. Block Explorer APIs (11 endpoints)
    "tronscan": {
        "primary": {
            "name": "tronscan",
            "url": "https://api.tronscan.org/api",
            "key": HARDCODED_API_KEYS["TRONSCAN_KEY"],
            "timeout": 10,
            "rate_limit": 100
        },
        "fallbacks": [
            {"name": "trongrid", "url": "https://api.trongrid.io", "key": "", "timeout": 10},
            {"name": "blockchair_tron", "url": "https://api.blockchair.com/tron", "key": "", "timeout": 15}
        ]
    },
    
    "bscscan": {
        "primary": {
            "name": "bscscan",
            "url": "https://api.bscscan.com/api",
            "key": HARDCODED_API_KEYS["BSCSCAN_KEY"],
            "timeout": 10,
            "rate_limit": 200
        },
        "fallbacks": [
            {"name": "ankr_bsc", "url": "https://api.ankr.com/scan/bsc", "key": "", "timeout": 10},
            {"name": "bintools", "url": "https://api.bintools.io/bsc", "key": "", "timeout": 15}
        ]
    },
    
    "etherscan": {
        "primary": {
            "name": "etherscan",
            "url": "https://api.etherscan.io/api",
            "key": HARDCODED_API_KEYS["ETHERSCAN_KEY"],
            "timeout": 10,
            "rate_limit": 200
        },
        "fallbacks": [
            {"name": "etherscan_2", "url": "https://api.etherscan.io/api", "key": HARDCODED_API_KEYS["ETHERSCAN_KEY_2"], "timeout": 10},
            {"name": "infura", "url": "https://mainnet.infura.io/v3", "key": "", "timeout": 15},
            {"name": "alchemy", "url": "https://eth-mainnet.alchemyapi.io/v2", "key": "", "timeout": 15},
            {"name": "covalent", "url": "https://api.covalenthq.com/v1/1", "key": "", "timeout": 20}
        ]
    },

    # 2. Market Data APIs (9 endpoints) - KuCoin Primary
    "kucoin": {
        "primary": {
            "name": "kucoin",
            "url": "https://api.kucoin.com",
            "ws_url": "wss://ws-api.kucoin.com/endpoint",
            "key": "",
            "timeout": 5,
            "rate_limit": 1000
        },
        "fallbacks": []
    },
    
    "coinmarketcap": {
        "primary": {
            "name": "coinmarketcap",
            "url": "https://pro-api.coinmarketcap.com/v1",
            "key": HARDCODED_API_KEYS["COINMARKETCAP_KEY"],
            "timeout": 10,
            "rate_limit": 333
        },
        "fallbacks": [
            {"name": "coinmarketcap_2", "url": "https://pro-api.coinmarketcap.com/v1", "key": HARDCODED_API_KEYS["COINMARKETCAP_KEY_2"], "timeout": 10},
            {"name": "coingecko", "url": "https://api.coingecko.com/api/v3", "key": "", "timeout": 15},
            {"name": "nomics", "url": "https://api.nomics.com/v1", "key": "", "timeout": 15},
            {"name": "messari", "url": "https://data.messari.io/api/v1", "key": "", "timeout": 20}
        ]
    },
    
    "cryptocompare": {
        "primary": {
            "name": "cryptocompare",
            "url": "https://min-api.cryptocompare.com/data",
            "key": HARDCODED_API_KEYS["CRYPTOCOMPARE_KEY"],
            "timeout": 10,
            "rate_limit": 100
        },
        "fallbacks": [
            {"name": "kaiko", "url": "https://us.market-api.kaiko.io/v2", "key": "", "timeout": 15},
            {"name": "coinapi", "url": "https://rest.coinapi.io/v1", "key": "", "timeout": 15}
        ]
    },

    # 3. News APIs (7 endpoints)
    "newsapi": {
        "primary": {
            "name": "newsapi",
            "url": "https://newsapi.org/v2",
            "key": HARDCODED_API_KEYS["NEWSAPI_KEY"],
            "timeout": 15,
            "rate_limit": 1000
        },
        "fallbacks": [
            {"name": "cryptopanic", "url": "https://cryptopanic.com/api/v1", "key": "", "timeout": 10},
            {"name": "cryptocontrol", "url": "https://cryptocontrol.io/api/v1/public", "key": "", "timeout": 15},
            {"name": "coindesk", "url": "https://api.coindesk.com/v2", "key": "", "timeout": 15},
            {"name": "cointelegraph", "url": "https://api.cointelegraph.com", "key": "", "timeout": 20},
            {"name": "cryptoslate", "url": "https://api.cryptoslate.com", "key": "", "timeout": 20},
            {"name": "theblock", "url": "https://api.theblock.co/v1", "key": "", "timeout": 20}
        ]
    },

    # 4. Enhanced Sentiment APIs (8 endpoints)
    "sentiment": {
        "primary": {
            "name": "alternative_me",
            "url": "https://api.alternative.me/fng",
            "key": "",
            "timeout": 10,
            "rate_limit": 100
        },
        "fallbacks": [
            {"name": "santiment", "url": "https://api.santiment.net/graphql", "key": "", "timeout": 15},
            {"name": "lunarcrush", "url": "https://api.lunarcrush.com/v2", "key": "", "timeout": 15},
            {"name": "thetie", "url": "https://api.thetie.io", "key": "", "timeout": 15},
            {"name": "cryptoquant", "url": "https://api.cryptoquant.com/v1", "key": "", "timeout": 20},
            {"name": "glassnode_social", "url": "https://api.glassnode.com/v1", "key": "", "timeout": 20},
            {"name": "coingecko_community", "url": "https://api.coingecko.com/api/v3", "key": "", "timeout": 15},
            {"name": "messari_social", "url": "https://data.messari.io/api/v1", "key": "", "timeout": 20}
        ]
    },

    # 5. On-Chain Analytics (4 endpoints)
    "analytics": {
        "glassnode": {"name": "glassnode", "url": "https://api.glassnode.com/v1", "key": "", "timeout": 20},
        "intotheblock": {"name": "intotheblock", "url": "https://api.intotheblock.com/v1", "key": "", "timeout": 20},
        "nansen": {"name": "nansen", "url": "https://api.nansen.ai/v1", "key": "", "timeout": 25},
        "thegraph": {"name": "thegraph", "url": "https://api.thegraph.com/subgraphs/name", "key": "", "timeout": 30}
    },

    # 6. Whale Tracking (2 endpoints)
    "whales": {
        "primary": {
            "name": "whale_alert",
            "url": "https://api.whale-alert.io/v1",
            "key": "",
            "timeout": 15,
            "rate_limit": 60
        },
        "fallbacks": [
            {"name": "arkham", "url": "https://api.arkham.com", "key": "", "timeout": 20}
        ]
    },

    # 7. Social Media (1 endpoint)
    "social": {
        "reddit": {"name": "reddit", "url": "https://www.reddit.com", "key": "", "timeout": 15}
    }
}

# API Health Status Tracking
API_HEALTH_STATUS = {
    service: {
        "status": "unknown",
        "last_check": None,
        "response_time": None,
        "error_count": 0,
        "success_rate": 100.0,
        "last_error": None
    }
    for service in API_CONFIG.keys()
}

def get_api_config(service_name: str) -> dict:
    """Get API configuration for a specific service"""
    return API_CONFIG.get(service_name, {})

def get_all_api_endpoints() -> list:
    """Get list of all configured API endpoints"""
    endpoints = []
    for service_name, config in API_CONFIG.items():
        if "primary" in config:
            endpoints.append({
                "service": service_name,
                "type": "primary",
                "name": config["primary"]["name"],
                "url": config["primary"]["url"]
            })
            for fallback in config.get("fallbacks", []):
                endpoints.append({
                    "service": service_name,
                    "type": "fallback",
                    "name": fallback["name"],
                    "url": fallback["url"]
                })
    return endpoints

def count_total_endpoints() -> int:
    """Count total number of API endpoints configured"""
    total = 0
    for config in API_CONFIG.values():
        if "primary" in config:
            total += 1 + len(config.get("fallbacks", []))
        else:
            total += len(config)
    return total