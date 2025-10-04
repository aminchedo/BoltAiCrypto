// src/services/websocket.ts
type Listener = (event: MessageEvent) => void;

function normalizeBase(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function resolveWsBase() {
  const env = (import.meta as any).env?.VITE_WS_URL as string | undefined;
  if (env && env.trim()) return normalizeBase(env.trim());
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}`;
}

export function connectWs(path: string, onMessage?: Listener, opts: { autoReconnect?: boolean; delayMs?: number } = {}) {
  const base = resolveWsBase();
  const url = path.startsWith('/') ? base + path : base + '/' + path;
  const ws = new WebSocket(url);

  const auto = opts.autoReconnect ?? true;
  const delay = opts.delayMs ?? 1500;

  if (onMessage) ws.addEventListener('message', onMessage);

  if (auto) {
    ws.addEventListener('close', () => {
      setTimeout(() => connectWs(path, onMessage, opts), delay);
    });
  }
  return ws;
}
