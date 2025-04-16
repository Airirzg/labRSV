import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;

    if (typeof id !== 'string' || !['READ', 'UNREAD'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    const message = await prisma.message.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json(message);
  } catch (error) {
    console.error('Error updating message status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
