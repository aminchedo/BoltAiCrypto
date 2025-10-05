import { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import PortfolioPanel from '../../components/PortfolioPanel';
import RiskPanel from '../../components/RiskPanel';
import CorrelationHeatMap from '../../components/CorrelationHeatMap';
import { api } from '../../services/api';
import Loading from '../../components/Loading';

export default function Portfolio() {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const data = await api.get('/api/risk/portfolio-assessment');
        setPortfolioData(data);
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
    const interval = setInterval(loadPortfolio, 15000); // Refresh every 15s

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <Loading message="Loading portfolio data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio & Risk</h1>
            <p className="text-sm text-slate-400">Real-time portfolio analysis and risk assessment</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Overview - 2 columns */}
        <div className="lg:col-span-2">
          <PortfolioPanel />
        </div>

        {/* Risk Panel - 1 column */}
        <div>
          <RiskPanel />
        </div>
      </div>

      {/* Correlation Heatmap */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <h2 className="text-xl font-bold text-white mb-4">Asset Correlation Matrix</h2>
        <CorrelationHeatMap />
      </div>

      {/* Positions Table */}
      {portfolioData?.positions && (
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <h2 className="text-xl font-bold text-white mb-4">Open Positions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Symbol</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Size</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Entry</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Current</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">P&L</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">P&L %</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.positions.map((position: any) => (
                  <tr key={position.symbol} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{position.symbol}</td>
                    <td className="py-3 px-4 text-slate-300 ltr-numbers">{position.size}</td>
                    <td className="py-3 px-4 text-slate-300 ltr-numbers">${position.entry_price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-300 ltr-numbers">${position.current_price.toFixed(2)}</td>
                    <td className={`py-3 px-4 ltr-numbers font-medium ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${position.pnl.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 ltr-numbers font-medium ${position.pnl_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnl_percent >= 0 ? '+' : ''}{position.pnl_percent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
