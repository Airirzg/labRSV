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
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType
) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
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
