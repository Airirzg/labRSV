import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock database - In production, use a real database
const bookings = [
  {
    id: 'booking-1',
    userId: 'user-1',
    equipment: 'Microscope XYZ-1000',
    startDate: '2025-02-10',
    endDate: '2025-02-12',
    status: 'approved',
    createdAt: '2025-02-05T12:00:00Z',
    updatedAt: '2025-02-05T12:00:00Z',
  },
  {
    id: 'booking-2',
    userId: 'user-1',
    equipment: 'Centrifuge Model-A',
    startDate: '2025-02-15',
    endDate: '2025-02-17',
    status: 'pending',
    createdAt: '2025-02-05T13:00:00Z',
    updatedAt: '2025-02-05T13:00:00Z',
  },
  {
    id: 'booking-3',
    userId: 'team-1',
    equipment: 'Mass Spectrometer Pro',
    startDate: '2025-02-20',
    endDate: '2025-02-22',
    status: 'approved',
    createdAt: '2025-02-05T14:00:00Z',
    updatedAt: '2025-02-05T14:00:00Z',
  },
  {
    id: 'booking-4',
    userId: 'team-1',
    equipment: 'PCR Machine X200',
    startDate: '2025-03-01',
    endDate: '2025-03-03',
    status: 'pending',
    createdAt: '2025-02-05T15:00:00Z',
    updatedAt: '2025-02-05T15:00:00Z',
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (req.method === 'GET') {
      // Get user's bookings
      const userBookings = bookings.filter(booking => booking.userId === decoded.id);
      res.status(200).json(userBookings);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Bookings API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
