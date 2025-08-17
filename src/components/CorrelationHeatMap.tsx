import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface CorrelationData {
  correlations: { [key: string]: { [key: string]: number } };
  symbols: string[];
  timestamp: number;
}

interface CorrelationHeatMapProps {
  data: CorrelationData;
  width?: number;
  height?: number;
  onCellClick?: (symbol1: string, symbol2: string, correlation: number) => void;
}

const CorrelationHeatMap: React.FC<CorrelationHeatMapProps> = ({
  data,
  width = 600,
  height = 400,
  onCellClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    symbol1: string;
    symbol2: string;
    correlation: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.symbols.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 50, right: 50, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.symbols)
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3
      .scaleBand()
      .domain(data.symbols)
      .range([0, innerHeight])
      .padding(0.05);

    // Color scale for correlations (-1 to 1)
    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlBu)
      .domain([1, -1]); // Reversed for intuitive colors

    // Create cells
    const cells = g
      .selectAll('.cell')
      .data(
        data.symbols.flatMap((symbol1) =>
          data.symbols.map((symbol2) => ({
            symbol1,
            symbol2,
            correlation: data.correlations[symbol1]?.[symbol2] || 0,
          }))
        )
      )
      .enter()
      .append('g')
      .attr('class', 'cell');

    // Add rectangles
    cells
      .append('rect')
      .attr('x', (d) => xScale(d.symbol1)!)
      .attr('y', (d) => yScale(d.symbol2)!)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => colorScale(d.correlation))
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        // Highlight cell
        d3.select(this).attr('stroke-width', 3).attr('stroke', '#ffffff');
        
        setHoveredCell({
          symbol1: d.symbol1,
          symbol2: d.symbol2,
          correlation: d.correlation,
          x: event.pageX,
          y: event.pageY,
        });
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-width', 1).attr('stroke', '#1f2937');
        setHoveredCell(null);
      })
      .on('click', (event, d) => {
        onCellClick?.(d.symbol1, d.symbol2, d.correlation);
      });

    // Add correlation values as text
    cells
      .append('text')
      .attr('x', (d) => xScale(d.symbol1)! + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.symbol2)! + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', (d) => (Math.abs(d.correlation) > 0.5 ? 'white' : 'black'))
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text((d) => d.correlation.toFixed(2))
      .style('pointer-events', 'none');

    // Add x-axis labels
    g.selectAll('.x-label')
      .data(data.symbols)
      .enter()
      .append('text')
      .attr('class', 'x-label')
      .attr('x', (d) => xScale(d)! + xScale.bandwidth() / 2)
      .attr('y', innerHeight + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d) => d);

    // Add y-axis labels
    g.selectAll('.y-label')
      .data(data.symbols)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -10)
      .attr('y', (d) => yScale(d)! + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d) => d);

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Asset Correlation Matrix');

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - margin.right - legendWidth;
    const legendY = height - 40;

    const legendScale = d3.scaleLinear().domain([-1, 1]).range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format('.1f'));

    // Create gradient
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'correlation-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%');

    gradient
      .selectAll('stop')
      .data(d3.range(-1, 1.1, 0.1))
      .enter()
      .append('stop')
      .attr('offset', (d) => `${((d + 1) / 2) * 100}%`)
      .attr('stop-color', (d) => colorScale(d));

    // Add legend rectangle
    svg
      .append('rect')
      .attr('x', legendX)
      .attr('y', legendY - legendHeight)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#correlation-gradient)')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);

    // Add legend axis
    svg
      .append('g')
      .attr('transform', `translate(${legendX}, ${legendY})`)
      .call(legendAxis)
      .selectAll('text')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px');

    svg
      .append('text')
      .attr('x', legendX + legendWidth / 2)
      .attr('y', legendY + 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .text('Correlation Coefficient');

  }, [data, width, height, onCellClick]);

  return (
    <div className="relative bg-gray-900 rounded-lg p-4">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ background: 'transparent' }}
      />
      
      {hoveredCell && (
        <div
          className="fixed z-50 bg-black bg-opacity-90 text-white p-3 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: hoveredCell.x + 10,
            top: hoveredCell.y - 10,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="text-sm font-semibold">
            {hoveredCell.symbol1} vs {hoveredCell.symbol2}
          </div>
          <div className="text-lg font-bold">
            {hoveredCell.correlation.toFixed(3)}
          </div>
          <div className="text-xs text-gray-300">
            {hoveredCell.correlation > 0.7
              ? 'Strong Positive'
              : hoveredCell.correlation > 0.3
              ? 'Moderate Positive'
              : hoveredCell.correlation > -0.3
              ? 'Weak'
              : hoveredCell.correlation > -0.7
              ? 'Moderate Negative'
              : 'Strong Negative'}
          </div>
        </div>
      )}
      
      {/* Statistics panel */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white p-3 rounded text-xs">
        <div className="space-y-1">
          <div>Assets: {data.symbols.length}</div>
          <div>
            Avg Correlation:{' '}
            {(
              Object.values(data.correlations)
                .flatMap(row => Object.values(row))
                .filter((val, i, arr) => i < arr.length - data.symbols.length) // Remove diagonal
                .reduce((a, b) => a + b, 0) / 
              (data.symbols.length * (data.symbols.length - 1))
            ).toFixed(3)}
          </div>
          <div className="text-gray-400">
            Updated: {new Date(data.timestamp * 1000).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationHeatMap;