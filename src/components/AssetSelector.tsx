import React, { useState, useRef, useEffect } from 'react';
import { Search, Star, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { dimensions, spacing, radius, typography } from '../utils/designTokens';

interface Asset {
  symbol: string;
  name: string;
  price?: number;
  change24h?: number;
  favorite?: boolean;
}

interface AssetSelectorProps {
  selected: string;
  onSelect: (symbol: string) => void;
  favorites?: string[];
  onToggleFavorite?: (symbol: string) => void;
  className?: string;
}

const QUICK_PICKS: Asset[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', favorite: true },
  { symbol: 'ETHUSDT', name: 'Ethereum', favorite: true },
  { symbol: 'BNBUSDT', name: 'BNB', favorite: false },
  { symbol: 'SOLUSDT', name: 'Solana', favorite: false },
  { symbol: 'ADAUSDT', name: 'Cardano', favorite: false },
  { symbol: 'XRPUSDT', name: 'Ripple', favorite: false },
];

const ALL_ASSETS: Asset[] = [
  ...QUICK_PICKS,
  { symbol: 'DOGEUSDT', name: 'Dogecoin' },
  { symbol: 'DOTUSDT', name: 'Polkadot' },
  { symbol: 'MATICUSDT', name: 'Polygon' },
  { symbol: 'AVAXUSDT', name: 'Avalanche' },
  { symbol: 'LINKUSDT', name: 'Chainlink' },
  { symbol: 'ATOMUSDT', name: 'Cosmos' },
  { symbol: 'UNIUSDT', name: 'Uniswap' },
  { symbol: 'LTCUSDT', name: 'Litecoin' },
  { symbol: 'ETCUSDT', name: 'Ethereum Classic' },
];

export default function AssetSelector({
  selected,
  onSelect,
  favorites = ['BTCUSDT', 'ETHUSDT'],
  onToggleFavorite,
  className,
}: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter assets based on search
  const filteredAssets = searchQuery
    ? ALL_ASSETS.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ALL_ASSETS.filter((asset) => favorites.includes(asset.symbol));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredAssets.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredAssets.length) % filteredAssets.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredAssets[highlightedIndex]) {
          onSelect(filteredAssets[highlightedIndex].symbol);
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  const selectedAsset = ALL_ASSETS.find((a) => a.symbol === selected);

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        style={{ fontSize: typography.sm }}
        aria-label="Select asset"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="font-semibold text-white">{selectedAsset?.symbol || selected}</span>
        <TrendingUp className="w-3 h-3 text-slate-400" style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            role="listbox"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search assets..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
                  style={{ fontSize: typography.sm }}
                  aria-label="Search assets"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-600/50 rounded transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Picks / Favorites */}
            {!searchQuery && (
              <div className="p-3 border-b border-white/10">
                <div className="text-xs font-medium text-slate-400 mb-2" style={{ fontSize: typography.xs }}>
                  Quick Picks
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PICKS.slice(0, 6).map((asset) => (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        onSelect(asset.symbol);
                        setIsOpen(false);
                      }}
                      className={clsx(
                        'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200',
                        asset.symbol === selected
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-slate-700/50 text-slate-300 border border-slate-600/30 hover:bg-slate-700/70'
                      )}
                      style={{ fontSize: typography.xs }}
                    >
                      {asset.symbol.replace('USDT', '')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Asset List */}
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset, index) => (
                  <button
                    key={asset.symbol}
                    onClick={() => {
                      onSelect(asset.symbol);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={clsx(
                      'w-full flex items-center justify-between px-4 py-2.5 transition-colors duration-150',
                      index === highlightedIndex
                        ? 'bg-slate-700/50'
                        : 'hover:bg-slate-700/30',
                      asset.symbol === selected && 'bg-cyan-500/10'
                    )}
                    role="option"
                    aria-selected={asset.symbol === selected}
                  >
                    <div className="flex items-center gap-3">
                      {onToggleFavorite && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(asset.symbol);
                          }}
                          className="p-1 hover:bg-slate-600/50 rounded transition-colors"
                          aria-label={favorites.includes(asset.symbol) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star
                            className={clsx(
                              'w-3 h-3 transition-colors',
                              favorites.includes(asset.symbol)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-500'
                            )}
                            style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }}
                          />
                        </button>
                      )}
                      <div className="text-left">
                        <div className="font-semibold text-white" style={{ fontSize: typography.sm }}>
                          {asset.symbol}
                        </div>
                        <div className="text-slate-400" style={{ fontSize: typography.xs }}>
                          {asset.name}
                        </div>
                      </div>
                    </div>
                    {asset.price && (
                      <div className="text-right">
                        <div className="text-white font-mono" style={{ fontSize: typography.sm }}>
                          ${asset.price.toLocaleString()}
                        </div>
                        {asset.change24h !== undefined && (
                          <div
                            className={clsx(
                              'font-medium',
                              asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                            )}
                            style={{ fontSize: typography.xs }}
                          >
                            {asset.change24h >= 0 ? '+' : ''}
                            {asset.change24h.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-slate-400" style={{ fontSize: typography.sm }}>
                  No assets found
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-slate-900/50">
              <div className="text-xs text-slate-500" style={{ fontSize: typography.xs }}>
                Press <kbd className="px-1 py-0.5 bg-slate-700/50 rounded">↑↓</kbd> to navigate,{' '}
                <kbd className="px-1 py-0.5 bg-slate-700/50 rounded">Enter</kbd> to select,{' '}
                <kbd className="px-1 py-0.5 bg-slate-700/50 rounded">Esc</kbd> to close
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
