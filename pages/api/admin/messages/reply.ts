import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/middleware/api-auth';
import { z } from 'zod';

const replySchema = z.object({
  messageId: z.string(),
  content: z.string(),
  recipientId: z.string(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const validation = replySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid request data', errors: validation.error.errors });
    }

    const { messageId, content, recipientId } = validation.data;
    const user = (req as any).user;

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to reply to messages' });
    }

    // Get the original message
    const originalMessage = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        subject: true,
        content: true,
        userId: true
      },
    });

    if (!originalMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }

    // Create the reply message
    const reply = await prisma.message.create({
      data: {
        subject: `Re: ${originalMessage.subject}`,
        content: content,
        senderName: 'Admin',
        senderEmail: user.email,
        recipientId: recipientId,
        parentId: messageId,
      },
    });

    // Create a notification for the recipient
    await prisma.notification.create({
      data: {
        userId: originalMessage.userId,
        title: 'New Reply to Your Message',
        message: `Admin has replied to your message "${originalMessage.subject}". messageId:${originalMessage.id}`,
        type: 'MESSAGE',
        read: false,
      }
    });

    return res.status(200).json({ message: 'Reply sent successfully', reply });
  } catch (error) {
    console.error('Error sending reply:', error);
    return res.status(500).json({ message: 'Error sending reply' });
  }
}

export default withAuth(handler);
