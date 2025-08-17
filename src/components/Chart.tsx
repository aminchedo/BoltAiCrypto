import React, { useEffect, useRef, useState } from 'react';

interface ChartProps {
  symbol: string;
}

interface OHLCVData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const Chart: React.FC<ChartProps> = ({ symbol }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<OHLCVData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [symbol]);

  useEffect(() => {
    if (chartData.length > 0) {
      drawChart();
    }
  }, [chartData]);

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/ohlcv/${symbol}?limit=50`);
      const data = await response.json();
      setChartData(data.data || []);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Chart settings
    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    // Calculate price range
    const prices = chartData.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    if (priceRange === 0) return;

    // Helper functions
    const getX = (index: number) => padding + (index * chartWidth) / (chartData.length - 1);
    const getY = (price: number) => padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    
    // Horizontal lines (price levels)
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i) / 5;
      const y = getY(price);
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      
      // Price labels
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), padding - 10, y + 4);
    }

    // Vertical lines (time)
    const timeInterval = Math.max(1, Math.floor(chartData.length / 8));
    for (let i = 0; i < chartData.length; i += timeInterval) {
      const x = getX(i);
      
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, canvas.height - padding);
      ctx.stroke();
      
      // Time labels
      const timeStr = new Date(chartData[i].timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, canvas.height - padding + 20);
    }

    // Draw candlesticks
    chartData.forEach((candle, index) => {
      const x = getX(index);
      const openY = getY(candle.open);
      const highY = getY(candle.high);
      const lowY = getY(candle.low);
      const closeY = getY(candle.close);

      const isBullish = candle.close > candle.open;
      const candleWidth = Math.max(2, chartWidth / chartData.length * 0.7);

      // Wick
      ctx.strokeStyle = isBullish ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = isBullish ? '#10b981' : '#ef4444';
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight || 1);
    });

    // Draw current price line
    if (chartData.length > 0) {
      const currentPrice = chartData[chartData.length - 1].close;
      const currentY = getY(currentPrice);
      
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, currentY);
      ctx.lineTo(canvas.width - padding, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current price label
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(canvas.width - padding + 5, currentY - 10, 80, 20);
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(currentPrice.toFixed(2), canvas.width - padding + 45, currentY + 4);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-800/30 rounded-xl">
        <div className="text-gray-400">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef}
        className="w-full h-96 bg-gray-800/30 rounded-xl border border-gray-700/50"
        style={{ minHeight: '384px' }}
      />
      {chartData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">No chart data available</div>
        </div>
      )}
    </div>
  );
};

export default Chart;