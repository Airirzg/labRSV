import { toast } from 'react-toastify';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const response = await fetch('/api/admin/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, text }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  metadata?: Record<string, any>
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Emit server-sent event for real-time notifications
    const eventData = {
      type: 'NOTIFICATION',
      data: notification,
    };

    // Send SSE event through the admin events endpoint
    await fetch('/api/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toast[type](message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
    return count;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    return 0;
  }
};
