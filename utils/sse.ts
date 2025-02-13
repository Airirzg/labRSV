import { NextApiResponse } from 'next';

export function initSSE(res: NextApiResponse) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);

  res.on('close', () => {
    clearInterval(heartbeat);
    res.end();
  });

  return sendEvent;
}

export class SSEManager {
  private static instance: SSEManager;
  private clients: Set<(data: any) => void>;

  private constructor() {
    this.clients = new Set();
  }

  static getInstance() {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  addClient(sendEvent: (data: any) => void) {
    this.clients.add(sendEvent);
  }

  removeClient(sendEvent: (data: any) => void) {
    this.clients.delete(sendEvent);
  }

  broadcast(data: any) {
    this.clients.forEach(sendEvent => sendEvent(data));
  }
}
