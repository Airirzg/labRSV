import { NextApiResponse } from 'next';

export function initSSE(res: NextApiResponse) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const sendEvent = (data: any) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Error sending SSE event:', error);
    }
  };

  return sendEvent;
}

type SendEventFunction = (data: any) => void;

export class SSEManager {
  private static instance: SSEManager;
  private clients: Map<string, SendEventFunction>;
  private reconnectAttempts: Map<string, number>;
  private readonly maxReconnectAttempts = 5;

  private constructor() {
    this.clients = new Map();
    this.reconnectAttempts = new Map();
  }

  static getInstance() {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  addClient(clientId: string, sendEvent: SendEventFunction) {
    this.clients.set(clientId, sendEvent);
    this.reconnectAttempts.set(clientId, 0);
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId);
    this.reconnectAttempts.delete(clientId);
  }

  broadcast(data: any) {
    this.clients.forEach((sendEvent, clientId) => {
      try {
        sendEvent(data);
      } catch (error) {
        console.error(`Error broadcasting to client ${clientId}:`, error);
        this.handleFailedBroadcast(clientId);
      }
    });
  }

  sendToClient(clientId: string, data: any) {
    const sendEvent = this.clients.get(clientId);
    if (sendEvent) {
      try {
        sendEvent(data);
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
        this.handleFailedBroadcast(clientId);
      }
    }
  }

  private handleFailedBroadcast(clientId: string) {
    const attempts = (this.reconnectAttempts.get(clientId) || 0) + 1;
    if (attempts >= this.maxReconnectAttempts) {
      console.log(`Removing client ${clientId} after ${attempts} failed attempts`);
      this.removeClient(clientId);
    } else {
      this.reconnectAttempts.set(clientId, attempts);
    }
  }

  getConnectedClients(): number {
    return this.clients.size;
  }
}
