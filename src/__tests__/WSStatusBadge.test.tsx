import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WSStatusBadge from '../components/header/WSStatusBadge';
import type { ConnectionState } from '../services/websocket';

describe('WSStatusBadge Component', () => {
  const createMockWsManager = (initialState: ConnectionState) => {
    const listeners: ((state: ConnectionState) => void)[] = [];
    
    return {
      getState: vi.fn(() => initialState),
      onStateChange: vi.fn((callback) => {
        listeners.push(callback);
        callback(initialState);
        return () => {
          const idx = listeners.indexOf(callback);
          if (idx > -1) listeners.splice(idx, 1);
        };
      }),
      connect: vi.fn(),
      disconnect: vi.fn(),
      send: vi.fn(),
      onMessage: vi.fn(),
      // Helper to trigger state change
      _triggerStateChange: (newState: ConnectionState) => {
        listeners.forEach(cb => cb(newState));
      },
    };
  };

  it('renders CONNECTED status', () => {
    const mockWsManager = createMockWsManager('connected');
    render(<WSStatusBadge wsManager={mockWsManager as any} />);
    
    expect(screen.getByText(/CONNECTED/i)).toBeInTheDocument();
  });

  it('renders DISCONNECTED status', () => {
    const mockWsManager = createMockWsManager('disconnected');
    render(<WSStatusBadge wsManager={mockWsManager as any} />);
    
    expect(screen.getByText(/DISCONNECTED/i)).toBeInTheDocument();
  });

  it('renders CONNECTING status', () => {
    const mockWsManager = createMockWsManager('connecting');
    render(<WSStatusBadge wsManager={mockWsManager as any} />);
    
    expect(screen.getByText(/CONNECTING/i)).toBeInTheDocument();
  });

  it('renders RECONNECTING status', () => {
    const mockWsManager = createMockWsManager('reconnecting');
    render(<WSStatusBadge wsManager={mockWsManager as any} />);
    
    expect(screen.getByText(/RECONNECTING/i)).toBeInTheDocument();
  });

  it('renders ERROR status', () => {
    const mockWsManager = createMockWsManager('error');
    render(<WSStatusBadge wsManager={mockWsManager as any} />);
    
    expect(screen.getByText(/ERROR/i)).toBeInTheDocument();
  });

  it('applies correct color classes for CONNECTED', () => {
    const mockWsManager = createMockWsManager('connected');
    const { container } = render(<WSStatusBadge wsManager={mockWsManager as any} />);
    
    const badge = container.querySelector('[class*="emerald"]');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct color classes for ERROR', () => {
    const mockWsManager = createMockWsManager('error');
    const { container } = render(<WSStatusBadge wsManager={mockWsManager as any} />);
    
    const badge = container.querySelector('[class*="red"]');
    expect(badge).toBeInTheDocument();
  });
});
