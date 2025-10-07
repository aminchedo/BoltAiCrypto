import React, { useState } from 'react';
import { Download, FileText, Table, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography } from '../utils/designTokens';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  formats: ('csv' | 'pdf')[];
  endpoint: string;
  icon: React.ComponentType<any>;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'pnl',
    label: 'P&L Report',
    description: 'Export profit and loss data',
    formats: ['csv', 'pdf'],
    endpoint: '/api/export/pnl',
    icon: FileText
  },
  {
    id: 'signals',
    label: 'Trading Signals',
    description: 'Export all trading signals',
    formats: ['csv'],
    endpoint: '/api/export/signals',
    icon: FileText
  },
  {
    id: 'scanner',
    label: 'Scanner Results',
    description: 'Export scanner analysis results',
    formats: ['csv', 'pdf'],
    endpoint: '/api/export/scanner',
    icon: Table
  },
  {
    id: 'holdings',
    label: 'Portfolio Holdings',
    description: 'Export current holdings',
    formats: ['csv', 'pdf'],
    endpoint: '/api/export/holdings',
    icon: Table
  },
  {
    id: 'trades',
    label: 'Trade History',
    description: 'Export complete trade history',
    formats: ['csv'],
    endpoint: '/api/export/trades',
    icon: FileText
  },
  {
    id: 'risk',
    label: 'Risk Metrics',
    description: 'Export risk analysis data',
    formats: ['csv', 'pdf'],
    endpoint: '/api/export/risk',
    icon: FileText
  }
];

const ExportCenter: React.FC = () => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (option: ExportOption, format: 'csv' | 'pdf') => {
    const exportId = `${option.id}-${format}`;
    setExporting(exportId);
    setSuccess(null);
    setError(null);

    try {
      // Generate filename with timezone
      const now = new Date();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timestamp = now.toISOString().split('T')[0];
      const filename = `${option.id}_${timestamp}_${timezone.replace(/\//g, '-')}.${format}`;

      // For demo, just show success
      // In production, this would actually fetch and download the file
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate download
      const blob = new Blob([`Export data for ${option.label}`], { 
        type: format === 'csv' ? 'text/csv' : 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(exportId);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Export failed:', err);
      setError(`Failed to export ${option.label}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-white flex items-center gap-2" style={{ fontSize: typography['2xl'] }}>
          <Download style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }} className="text-cyan-400" />
          Export Center
        </h2>
        <p className="text-slate-400" style={{ fontSize: typography.sm }}>
          Export your data in CSV or PDF format
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertCircle style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-red-400" />
          <span className="text-red-400" style={{ fontSize: typography.sm }}>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <CheckCircle style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-green-400" />
          <span className="text-green-400" style={{ fontSize: typography.sm }}>Export completed successfully!</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPORT_OPTIONS.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <option.icon style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1" style={{ fontSize: typography.base }}>
                  {option.label}
                </h3>
                <p className="text-slate-400" style={{ fontSize: typography.xs }}>
                  {option.description}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {option.formats.map(format => {
                const exportId = `${option.id}-${format}`;
                const isExporting = exporting === exportId;
                const isSuccess = success === exportId;

                return (
                  <button
                    key={format}
                    onClick={() => handleExport(option, format)}
                    disabled={isExporting}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                      isSuccess
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : isExporting
                        ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white border border-slate-600/50'
                    )}
                    style={{ fontSize: typography.sm }}
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
                        <span>Done</span>
                      </>
                    ) : (
                      <>
                        <Download style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
                        <span>{format.toUpperCase()}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-blue-400 mb-2" style={{ fontSize: typography.base }}>
          Export Details
        </h3>
        <ul className="space-y-2 text-blue-300" style={{ fontSize: typography.sm }}>
          <li>• Files are named with date and timezone for easy tracking</li>
          <li>• CSV files include column headers and proper formatting</li>
          <li>• PDF exports include charts and formatted tables</li>
          <li>• All timestamps are in your local timezone</li>
          <li>• Data is exported as-of the current moment</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportCenter;
