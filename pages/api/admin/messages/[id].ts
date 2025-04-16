import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid message ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const message = await prisma.message.findUnique({
          where: { id },
        });

        if (!message) {
          return res.status(404).json({ message: 'Message not found' });
        }

        return res.status(200).json(message);
      } catch (error) {
        console.error('Error fetching message:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    case 'DELETE':
      try {
        await prisma.message.delete({
          where: { id },
        });

        return res.status(200).json({ message: 'Message deleted successfully' });
      } catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
