export type ConnectionStatus = 'connected' | 'local';

let connectionStatus: ConnectionStatus = 'local';
let statusListeners: ((status: ConnectionStatus) => void)[] = [];

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      if (window.location.port === '5173') {
        return 'http://localhost:5000/api';
      }
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

export const apiClient = {
  // Get current connection state
  getStatus(): ConnectionStatus {
    return connectionStatus;
  },

  // Subscribe to changes in online status
  subscribe(listener: (status: ConnectionStatus) => void) {
    statusListeners.push(listener);
    listener(connectionStatus);
    return () => {
      statusListeners = statusListeners.filter(l => l !== listener);
    };
  },

  // Update status and alert listeners
  setStatus(newStatus: ConnectionStatus) {
    if (connectionStatus !== newStatus) {
      connectionStatus = newStatus;
      statusListeners.forEach(listener => listener(newStatus));
      console.log(`[Second Brain] Sync status changed: ${newStatus}`);
    }
  },

  // Run a periodic health check
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      // Increase timeout to 8000ms to gracefully handle Render free-tier cold starts
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.setStatus('connected');
        return true;
      }
    } catch (e) {
      console.warn('[Second Brain Health Check] Health check timed out or offline:', e);
    }
    this.setStatus('local');
    return false;
  },

  // Generic request handler
  async request<T>(path: string, options: RequestInit = {}): Promise<T | null> {
    try {
      const controller = new AbortController();
      // Increase timeout to 30000ms to allow local inference and network STT processing
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        this.setStatus('connected');
        return await response.json();
      }
    } catch (e) {
      console.warn(`[Second Brain API Error] Failed to contact ${path}. Falling back to local storage.`);
    }
    this.setStatus('local');
    return null;
  },

  async get<T>(path: string, params?: Record<string, string>): Promise<T | null> {
    let queryString = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => searchParams.append(key, val));
      queryString = `?${searchParams.toString()}`;
    }
    return this.request<T>(`${path}${queryString}`, { method: 'GET' });
  },

  async post<T>(path: string, body: any): Promise<T | null> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async put<T>(path: string, body: any): Promise<T | null> {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  async delete<T>(path: string): Promise<T | null> {
    return this.request<T>(path, { method: 'DELETE' });
  }
};

// Start background health checking
if (typeof window !== 'undefined') {
  apiClient.checkHealth();
  setInterval(() => {
    apiClient.checkHealth();
  }, 5000);
}
