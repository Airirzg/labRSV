import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User ID not found' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const profile = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
          },
        });

        if (!profile) {
          return res.status(404).json({ message: 'Profile not found' });
        }

        return res.status(200).json(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    case 'PUT':
      try {
        const { name, email } = req.body;

        if (!name || !email) {
          return res.status(400).json({ message: 'Name and email are required' });
        }

        const updatedProfile = await prisma.user.update({
          where: { id: userId },
          data: { name, email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
          },
        });

        return res.status(200).json(updatedProfile);
      } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}
