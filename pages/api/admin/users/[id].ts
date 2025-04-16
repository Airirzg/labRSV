import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const user = await prisma.user.findUnique({
          where: { id },
          include: {
            reservations: {
              include: {
                equipment: true,
              },
            },
          },
        });

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    case 'DELETE':
      try {
        // Check if user is an admin
        const user = await prisma.user.findUnique({
          where: { id },
          select: { role: true },
        });

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'ADMIN') {
          return res.status(403).json({ message: 'Cannot delete admin users' });
        }

        // Delete user's notifications
        await prisma.notification.deleteMany({
          where: { userId: id },
        });

        // Delete user's reservations
        await prisma.reservation.deleteMany({
          where: { userId: id },
        });

        // Delete the user
        await prisma.user.delete({
          where: { id },
        });

        return res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
