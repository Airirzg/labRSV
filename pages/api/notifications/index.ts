import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withAuth, AuthenticatedRequest } from '@/middleware/api-auth';

const getNotificationsSchema = z.object({
  userId: z.string(),
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.enum(['ALL', 'UNREAD']).optional(),
});

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  switch (req.method) {
    case 'GET':
      return await getNotifications(req, res);
    case 'PUT':
      return await markAsRead(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getNotifications(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    console.log('Request query:', req.query);
    console.log('Authenticated user:', req.user);

    const validation = getNotificationsSchema.safeParse({
      ...req.query,
      page: req.query.page || '1',
      limit: req.query.limit || '10',
      type: req.query.type || 'ALL',
    });

    if (!validation.success) {
      console.error('Validation error:', validation.error.errors);
      return res.status(400).json({ 
        message: 'Invalid request parameters', 
        errors: validation.error.errors 
      });
    }

    const { userId, page, limit, type } = validation.data;
    console.log('Validated data:', { userId, page, limit, type });

    // Allow users to view their own notifications or admins to view any
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      console.error('Authorization error:', {
        requestedUserId: userId,
        authenticatedUserId: req.user.id,
        userRole: req.user.role
      });
      return res.status(403).json({ message: 'Not authorized to view these notifications' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      userId,
      ...(type === 'UNREAD' ? { read: false } : {}),
    };

    console.log('Database query:', { where, skip, take });

    // First get notifications
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          read: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where }),
    ]);

    console.log('Found notifications:', notifications.length);
    console.log('Total notifications:', total);

    // For message notifications, fetch the associated message details
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        if (notification.type === 'MESSAGE') {
          try {
            // For message notifications, try to extract message ID from the notification message
            // This is a temporary solution until we add proper metadata support
            const messageIdMatch = notification.message.match(/messageId:(\w+)/);
            const messageId = messageIdMatch ? messageIdMatch[1] : null;
            
            if (messageId) {
              const message = await prisma.message.findUnique({
                where: { id: messageId },
                select: {
                  id: true,
                  subject: true,
                  content: true,
                  senderName: true,
                  senderEmail: true,
                  createdAt: true,
                },
              });
              return {
                ...notification,
                messageDetails: message,
              };
            }
          } catch (error) {
            console.error('Error processing message notification:', error);
          }
        }
        return notification;
      })
    );

    return res.status(200).json({
      notifications: notificationsWithDetails,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        currentPage: parseInt(page),
        perPage: take,
      },
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return res.status(500).json({ 
      message: 'Error fetching notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function markAsRead(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const validation = markAsReadSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid request parameters', 
        errors: validation.error.errors 
      });
    }

    const { notificationIds } = validation.data;

    // If not admin, verify user owns these notifications
    if (req.user.role !== 'ADMIN') {
      const notifications = await prisma.notification.findMany({
        where: {
          id: { in: notificationIds },
        },
        select: {
          userId: true,
        },
      });

      const hasUnauthorizedAccess = notifications.some(n => n.userId !== req.user.id);
      if (hasUnauthorizedAccess) {
        return res.status(403).json({ message: 'Not authorized to mark these notifications as read' });
      }
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
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

export default withAuth(handler);
