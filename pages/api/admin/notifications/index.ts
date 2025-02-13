import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getNotifications(req, res);
    case 'PUT':
      return markAsRead(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getNotifications(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Error fetching notifications' });
  }
}

async function markAsRead(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { notificationIds } = req.body;
    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'Notification IDs array is required' });
    }

    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });

    return res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({ message: 'Error marking notifications as read' });
  }
}
