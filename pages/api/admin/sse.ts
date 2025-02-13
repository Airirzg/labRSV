import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { initSSE, SSEManager } from '@/utils/sse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const sendEvent = initSSE(res);
    const sseManager = SSEManager.getInstance();
    sseManager.addClient(sendEvent);

    // Clean up on connection close
    res.on('close', () => {
      sseManager.removeClient(sendEvent);
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
