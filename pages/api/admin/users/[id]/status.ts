import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { isActive } = req.body;

    if (typeof id !== 'string' || typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Account Status Updated',
        message: `Your account has been ${isActive ? 'activated' : 'deactivated'}.`,
        type: 'ACCOUNT_UPDATE',
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
