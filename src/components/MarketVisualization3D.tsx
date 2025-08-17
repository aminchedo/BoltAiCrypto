import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  volatility: number;
}

interface Market3DVisualizationProps {
  marketData: MarketData[];
  selectedSymbol?: string;
  onSymbolSelect?: (symbol: string) => void;
}

const MarketSphere: React.FC<{
  data: MarketData;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}> = ({ data, position, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Animate the sphere
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  
  // Calculate sphere properties based on data
  const radius = Math.max(0.2, Math.min(2, data.volume / 10000));
  const color = data.change24h >= 0 ? '#10b981' : '#ef4444';
  const intensity = Math.abs(data.change24h) / 10;
  
  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[radius, 32, 32]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.3}
          transparent
          opacity={isSelected ? 1 : 0.8}
          wireframe={hovered}
        />
      </Sphere>
      
      {/* Price label */}
      <Text
        position={[0, radius + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data.symbol}
      </Text>
      
      <Text
        position={[0, radius + 0.2, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        ${data.price.toFixed(2)}
      </Text>
      
      {/* Volatility indicator */}
      <Box
        position={[0, -radius - 0.3, 0]}
        args={[data.volatility * 2, 0.1, 0.1]}
      >
        <meshStandardMaterial color="#fbbf24" />
      </Box>
    </group>
  );
};

const ConnectionLines: React.FC<{ marketData: MarketData[] }> = ({ marketData }) => {
  const lines = useMemo(() => {
    const connections = [];
    for (let i = 0; i < marketData.length; i++) {
      for (let j = i + 1; j < marketData.length; j++) {
        // Create correlation-based connections
        const correlation = Math.random() * 0.8 + 0.2; // Mock correlation
        if (correlation > 0.6) {
          const angle1 = (i / marketData.length) * Math.PI * 2;
          const angle2 = (j / marketData.length) * Math.PI * 2;
          const radius = 5;
          
          const pos1: [number, number, number] = [
            Math.cos(angle1) * radius,
            0,
            Math.sin(angle1) * radius
          ];
          const pos2: [number, number, number] = [
            Math.cos(angle2) * radius,
            0,
            Math.sin(angle2) * radius
          ];
          
          connections.push({
            points: [pos1, pos2],
            color: correlation > 0 ? '#10b981' : '#ef4444',
            opacity: correlation * 0.5
          });
        }
      }
    }
    return connections;
  }, [marketData]);
  
  return (
    <>
      {lines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          color={line.color}
          lineWidth={2}
          transparent
          opacity={line.opacity}
        />
      ))}
    </>
  );
};

const PriceGrid: React.FC = () => {
  const gridRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (gridRef.current) {
      gridRef.current.rotation.y += 0.002;
    }
  });
  
  return (
    <group ref={gridRef}>
      {/* Create a grid of price levels */}
      {Array.from({ length: 10 }, (_, i) => (
        <React.Fragment key={i}>
          <Line
            points={[[-8, i - 5, -8], [8, i - 5, -8]]}
            color="#374151"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
          <Line
            points={[[-8, i - 5, 8], [8, i - 5, 8]]}
            color="#374151"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
          <Line
            points={[[-8, i - 5, -8], [-8, i - 5, 8]]}
            color="#374151"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
          <Line
            points={[[8, i - 5, -8], [8, i - 5, 8]]}
            color="#374151"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        </React.Fragment>
      ))}
    </group>
  );
};

const CameraController: React.FC = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(10, 5, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return null;
};

const Market3DVisualization: React.FC<Market3DVisualizationProps> = ({
  marketData,
  selectedSymbol,
  onSymbolSelect
}) => {
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Position markets in a circle
  const marketPositions = useMemo(() => {
    return marketData.map((_, index) => {
      const angle = (index / marketData.length) * Math.PI * 2;
      const radius = 5;
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ] as [number, number, number];
    });
  }, [marketData]);
  
  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1 text-xs rounded ${
            autoRotate ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Auto Rotate
        </button>
      </div>
      
      <Canvas>
        <CameraController />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        {/* Grid */}
        <PriceGrid />
        
        {/* Market spheres */}
        {marketData.map((data, index) => (
          <MarketSphere
            key={data.symbol}
            data={data}
            position={marketPositions[index]}
            isSelected={selectedSymbol === data.symbol}
            onClick={() => onSymbolSelect?.(data.symbol)}
          />
        ))}
        
        {/* Connection lines */}
        <ConnectionLines marketData={marketData} />
        
        {/* Controls */}
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          enableZoom={true}
          enablePan={true}
          maxDistance={20}
          minDistance={3}
        />
      </Canvas>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white p-3 rounded text-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Positive Change</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Negative Change</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-1 bg-yellow-500"></div>
            <span>Volatility</span>
          </div>
          <div className="text-gray-400">
            Sphere size = Volume
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market3DVisualization;