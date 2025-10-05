import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgentToggle from '../components/header/AgentToggle';
import * as agentService from '../services/agent';

// Mock the agent service
vi.mock('../services/agent');

describe('AgentToggle Component', () => {
  const mockWsManager = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    getState: vi.fn(),
    onMessage: vi.fn(),
    onStateChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial OFF state', async () => {
    vi.mocked(agentService.getAgentStatus).mockResolvedValue({
      enabled: false,
      scan_interval_ms: 10000,
      subscribed_symbols: [],
    });

    render(<AgentToggle wsManager={mockWsManager as any} />);

    await waitFor(() => {
      expect(screen.getByText(/Agent: OFF/i)).toBeInTheDocument();
    });
  });

  it('renders with initial ON state', async () => {
    vi.mocked(agentService.getAgentStatus).mockResolvedValue({
      enabled: true,
      scan_interval_ms: 10000,
      subscribed_symbols: ['BTCUSDT'],
    });

    render(<AgentToggle wsManager={mockWsManager as any} />);

    await waitFor(() => {
      expect(screen.getByText(/Agent: ON/i)).toBeInTheDocument();
    });
  });

  it('toggles agent from OFF to ON', async () => {
    vi.mocked(agentService.getAgentStatus).mockResolvedValue({
      enabled: false,
      scan_interval_ms: 10000,
      subscribed_symbols: [],
    });

    vi.mocked(agentService.toggleAgent).mockResolvedValue({
      enabled: true,
      scan_interval_ms: 10000,
      subscribed_symbols: ['BTCUSDT'],
    });

    vi.mocked(agentService.subscribeSymbols).mockResolvedValue({
      status: 'subscribed',
      subscribed_symbols: ['BTCUSDT'],
    });

    render(<AgentToggle wsManager={mockWsManager as any} watchlistSymbols={['BTCUSDT']} />);

    await waitFor(() => {
      expect(screen.getByText(/Agent: OFF/i)).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(agentService.toggleAgent).toHaveBeenCalledWith(true);
      expect(mockWsManager.connect).toHaveBeenCalled();
      expect(screen.getByText(/Agent: ON/i)).toBeInTheDocument();
    });
  });

  it('toggles agent from ON to OFF', async () => {
    vi.mocked(agentService.getAgentStatus).mockResolvedValue({
      enabled: true,
      scan_interval_ms: 10000,
      subscribed_symbols: ['BTCUSDT'],
    });

    vi.mocked(agentService.toggleAgent).mockResolvedValue({
      enabled: false,
      scan_interval_ms: 10000,
      subscribed_symbols: [],
    });

    render(<AgentToggle wsManager={mockWsManager as any} />);

    await waitFor(() => {
      expect(screen.getByText(/Agent: ON/i)).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(agentService.toggleAgent).toHaveBeenCalledWith(false);
      expect(mockWsManager.disconnect).toHaveBeenCalled();
      expect(screen.getByText(/Agent: OFF/i)).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    vi.mocked(agentService.getAgentStatus).mockResolvedValue({
      enabled: false,
      scan_interval_ms: 10000,
      subscribed_symbols: [],
    });

    vi.mocked(agentService.toggleAgent).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        enabled: true,
        scan_interval_ms: 10000,
        subscribed_symbols: [],
      }), 100))
    );

    render(<AgentToggle wsManager={mockWsManager as any} />);

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Button should be disabled while loading
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('handles toggle error gracefully', async () => {
    vi.mocked(agentService.getAgentStatus).mockResolvedValue({
      enabled: false,
      scan_interval_ms: 10000,
      subscribed_symbols: [],
    });

    vi.mocked(agentService.toggleAgent).mockRejectedValue(
      new Error('Network error')
    );

    render(<AgentToggle wsManager={mockWsManager as any} />);

    await waitFor(() => {
      expect(screen.getByText(/Agent: OFF/i)).toBeInTheDocument();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      // Should show error and remain in OFF state
      expect(screen.getByText(/Agent: OFF/i)).toBeInTheDocument();
    });
  });
});
