/**
 * English localization constants
 * All UI text strings for the HTS Trading System
 */

export const en = {
  // App Header
  app: {
    title: 'HTS Trading System',
    subtitle: 'Hybrid Trading Strategy v1.0',
  },

  // Navigation Tabs
  nav: {
    comprehensiveScanner: 'Comprehensive Scanner',
    simpleScanner: 'Simple Scanner',
    strategyBuilder: 'Strategy Builder',
    signals: 'Signals',
    portfolio: 'Portfolio',
    pnl: 'P&L Analysis',
    backtest: 'Backtest',
    analytics: 'Advanced Analytics',
    notifications: 'Notifications',
    apiStatus: 'API Status',
  },

  // Scanner Page
  scanner: {
    title: 'Advanced Market Scanner',
    subtitle: 'Multi-timeframe scan with 9 professional algorithms',
    quickFilters: 'Quick Filters',
    quickFiltersLabel: 'Quick Filters',
    deepScan: 'Deep Scan',
    quickScan: 'Quick Scan',
    scanning: 'Scanning...',
    deepScanning: 'Deep scanning in progress...',
    autoRefresh: 'Auto Refresh',
    autoRefreshOff: 'Off',
    history: 'History',
    
    // Error messages
    errorSelectSymbol: 'Please select at least one symbol',
    errorSelectTimeframe: 'Please select at least one timeframe',
    errorScanFailed: 'Scan failed',
    
    // Empty states
    emptyReady: 'Ready to Scan',
    emptyReadyDesc: 'Select symbols and timeframes, then hit the scan button',
    emptyNoResults: 'No Results Found',
    emptyNoResultsDesc: 'No opportunities found with current criteria. Try adjusting filters or adding more symbols',
    
    // Filters
    filters: {
      popular: 'Popular',
      defi: 'DeFi',
      layer1: 'Layer 1',
      top10: 'Top 10',
      stablecoins: 'Stablecoins',
    },
    
    // Timeframes
    timeframes: {
      '1m': '1 Minute',
      '5m': '5 Minutes',
      '15m': '15 Minutes',
      '30m': '30 Minutes',
      '1h': '1 Hour',
      '4h': '4 Hours',
      '1d': '1 Day',
      '1w': '1 Week',
    },
    
    // Auto-refresh intervals
    refreshIntervals: {
      '1min': '1 minute',
      '5min': '5 minutes',
      '15min': '15 minutes',
      '30min': '30 minutes',
    },
    
    // View modes
    viewModes: {
      list: 'List View',
      grid: 'Grid View',
      chart: 'Chart View',
      heatmap: 'Heatmap',
    },
    
    // Direction filters
    directions: {
      all: 'All',
      bullish: 'Bullish Only',
      bearish: 'Bearish Only',
      neutral: 'Neutral',
    },
    
    // Sort options
    sort: {
      score: 'Score',
      symbol: 'Symbol',
      change: 'Change',
      volume: 'Volume',
    },
    
    // Advanced filters
    advancedFilters: 'Advanced Filters',
    scoreRange: 'Score Range',
    priceChange: 'Price Change',
    priceChangeAny: 'Any',
    priceChangeGainers: 'Gainers',
    priceChangeLosers: 'Losers',
    priceChangeBigMovers: 'Big Movers',
    minimumVolume: 'Minimum Volume',
    minimumSignals: 'Minimum Signals',
    tfAgreement: 'Timeframe Agreement',
    tfAgreementAny: 'Any',
    tfAgreementMajority: 'Majority',
    tfAgreementFull: 'Full',
    
    // Results
    results: 'Results',
    resultsCount: 'result(s)',
    lastScan: 'Last scan',
    search: 'Search symbols...',
    compare: 'Compare',
    compareSelected: 'Compare Selected',
    export: 'Export',
    
    // Keyboard shortcuts
    shortcuts: {
      title: 'Keyboard Shortcuts',
      deepScan: 'Run deep scan',
      quickScan: 'Run quick scan',
      listView: 'List view',
      gridView: 'Grid view',
      chartView: 'Chart view',
      heatmapView: 'Heatmap view',
      advancedFilters: 'Toggle advanced filters',
      bullishOnly: 'Bullish only',
      bearishOnly: 'Bearish only',
      resetFilter: 'Reset direction filter',
      help: 'Show shortcuts',
      close: 'Close modals',
    },
  },

  // Dashboard
  dashboard: {
    generateSignal: 'Generate Signal',
    analyzing: 'Analyzing...',
    liveSignals: 'Live Signals',
    noSignals: 'No Active Signals',
    noSignalsDesc: 'Select a symbol and generate a signal to get started',
    priceChart: 'Price Chart',
    analysisDetails: 'Analysis Details',
    rsiValue: 'RSI Value',
    macdHistogram: 'MACD Histogram',
    atr: 'ATR',
    trendStrength: 'Trend Strength',
    marketOverview: 'Market Overview',
    marketOverviewKucoin: 'Market Overview (KuCoin Data)',
    symbol: 'Symbol',
    price: 'Price',
    change24h: '24h Change',
    volume24h: 'Volume (24h)',
    signal: 'Signal',
    dataSource: 'Data Source',
    confidence: 'Confidence',
    noSignalText: 'No Signal',
  },

  // API Health
  apiHealth: {
    title: 'API Health Status',
    totalApis: 'Total APIs',
    healthy: 'Healthy',
    unhealthy: 'Unhealthy',
    overallHealth: 'Overall Health',
    loading: 'Loading API health data...',
  },

  // Notifications
  notifications: {
    title: 'Telegram Notifications',
    settings: 'Notification Settings',
    signalAlerts: 'Signal Alerts',
    portfolioAlerts: 'Portfolio Alerts',
    riskAlerts: 'Risk Alerts',
    dailySummary: 'Daily Summary',
    configuration: 'Configuration',
    chatId: 'Telegram Chat ID',
    chatIdPlaceholder: 'Enter your chat ID',
    minConfidence: 'Min Confidence Threshold',
    testConnection: 'Test Connection',
    sendTest: 'Send Test',
    testDesc: 'Send a test message to verify your Telegram setup',
    recentNotifications: 'Recent Notifications',
  },

  // Analytics
  analytics: {
    title: 'Advanced Analytics',
    temporarilyDisabled: 'Advanced analytics temporarily disabled',
    notAvailable: 'This section is currently unavailable',
  },

  // Common UI elements
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    apply: 'Apply',
    reset: 'Reset',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
  },

  // Trade execution
  trade: {
    execution: 'Trade Execution Request',
    action: 'Action',
    entry: 'Entry',
    stopLoss: 'Stop Loss',
    takeProfit: 'Take Profit',
    positionSize: 'Position Size',
    executeQuestion: 'Execute this trade?',
    executionComplete: 'Trade execution simulation completed!',
  },
} as const;

export type Locale = typeof en;

// Export default for convenience
export default en;
