import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight, ArrowUpDown } from 'lucide-react';
import { ScanResult } from '../../types';

interface ResultsTableProps {
  data: ScanResult[];
  onRowClick?: (result: ScanResult) => void;
}

type SortKey = 'symbol' | 'timeframe' | 'action' | 'price' | 'change24h' | 'score' | 'confidence';
type SortOrder = 'asc' | 'desc';

export default function ResultsTable({ data, onRowClick }: ResultsTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const getScore = (result: ScanResult): number => {
    return result.overall_score ?? result.final_score ?? result.score ?? 0;
  };

  const getDirection = (result: ScanResult): string => {
    return result.overall_direction ?? result.direction ?? 'NEUTRAL';
  };

  // Sort the data
  const sortedData = [...data].sort((a, b) => {
    let aVal: any, bVal: any;

    switch (sortBy) {
      case 'symbol':
        aVal = a.symbol;
        bVal = b.symbol;
        break;
      case 'timeframe':
        aVal = a.timeframe || '';
        bVal = b.timeframe || '';
        break;
      case 'action':
        aVal = getDirection(a);
        bVal = getDirection(b);
        break;
      case 'price':
        aVal = a.price || 0;
        bVal = b.price || 0;
        break;
      case 'change24h':
        aVal = a.change_24h || 0;
        bVal = b.change_24h || 0;
        break;
      case 'score':
        aVal = getScore(a);
        bVal = getScore(b);
        break;
      case 'confidence':
        aVal = a.confidence || 0;
        bVal = b.confidence || 0;
        break;
      default:
        aVal = 0;
        bVal = 0;
    }

    const order = sortOrder === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * order;
    }
    
    return (aVal > bVal ? 1 : -1) * order;
  });

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortBy !== columnKey) return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
    return sortOrder === 'asc' ? 
      <TrendingUp className="w-3 h-3 text-cyan-400" /> : 
      <TrendingDown className="w-3 h-3 text-cyan-400" />;
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/80 border-b border-slate-700/50">
            <tr>
              <th 
                className="text-left p-4 text-slate-300 font-semibold cursor-pointer hover:text-slate-50 transition-colors group"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-2">
                  Symbol
                  <SortIcon columnKey="symbol" />
                </div>
              </th>
              <th 
                className="text-left p-4 text-slate-300 font-semibold cursor-pointer hover:text-slate-50 transition-colors group"
                onClick={() => handleSort('timeframe')}
              >
                <div className="flex items-center gap-2">
                  Timeframe
                  <SortIcon columnKey="timeframe" />
                </div>
              </th>
              <th 
                className="text-center p-4 text-slate-300 font-semibold cursor-pointer hover:text-slate-50 transition-colors group"
                onClick={() => handleSort('action')}
              >
                <div className="flex items-center justify-center gap-2">
                  Signal
                  <SortIcon columnKey="action" />
                </div>
              </th>
              <th 
                className="text-right p-4 text-slate-300 font-semibold cursor-pointer hover:text-slate-50 transition-colors group"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end gap-2">
                  Price
                  <SortIcon columnKey="price" />
                </div>
              </th>
              <th 
                className="text-right p-4 text-slate-300 font-semibold cursor-pointer hover:text-slate-50 transition-colors group"
                onClick={() => handleSort('change24h')}
              >
                <div className="flex items-center justify-end gap-2">
                  24h Change
                  <SortIcon columnKey="change24h" />
                </div>
              </th>
              <th 
                className="text-right p-4 text-slate-300 font-semibold cursor-pointer hover:text-slate-50 transition-colors group"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center justify-end gap-2">
                  Score
                  <SortIcon columnKey="score" />
                </div>
              </th>
              <th 
                className="text-right p-4 text-slate-300 font-semibold cursor-pointer hover:text-slate-50 transition-colors group"
                onClick={() => handleSort('confidence')}
              >
                <div className="flex items-center justify-end gap-2">
                  Confidence
                  <SortIcon columnKey="confidence" />
                </div>
              </th>
              <th className="text-center p-4 text-slate-300 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => {
              const score = getScore(row);
              const direction = getDirection(row);
              
              return (
                <motion.tr
                  key={`${row.symbol}-${row.timeframe}-${index}`}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="p-4 font-bold text-slate-50">{row.symbol}</td>
                  <td className="p-4 text-slate-400">{row.timeframe || 'N/A'}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      direction === 'BULLISH' || direction === 'BUY'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : direction === 'BEARISH' || direction === 'SELL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    }`}>
                      {direction}
                    </span>
                  </td>
                  <td className="text-right p-4 text-slate-50 font-mono font-medium">
                    ${row.price?.toFixed(2) || 'N/A'}
                  </td>
                  <td className={`text-right p-4 font-semibold ${
                    (row.change_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <div className="flex items-center justify-end gap-1">
                      {(row.change_24h || 0) >= 0 ? 
                        <TrendingUp className="w-4 h-4" /> : 
                        <TrendingDown className="w-4 h-4" />
                      }
                      {(row.change_24h || 0) >= 0 ? '+' : ''}{(row.change_24h || 0).toFixed(2)}%
                    </div>
                  </td>
                  <td className="text-right p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      score >= 70 ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                      score >= 40 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                      'bg-red-500/20 text-red-400 border border-red-500/50'
                    }`}>
                      {score.toFixed(0)}
                    </span>
                  </td>
                  <td className="text-right p-4 text-cyan-400 font-semibold font-mono">
                    {((row.confidence || 0) * 100).toFixed(0)}%
                  </td>
                  <td className="text-center p-4">
                    <motion.button 
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick?.(row);
                      }}
                    >
                      View
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {sortedData.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-slate-600 mb-2">
            <ArrowUpDown className="w-12 h-12 mx-auto mb-3" />
          </div>
          <p className="text-slate-400 text-sm">No results to display</p>
        </div>
      )}
    </div>
  );
}
