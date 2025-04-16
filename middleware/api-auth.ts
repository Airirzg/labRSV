import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  type: 'individual' | 'team';
  role: string;
  teamIds?: string[];
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: AuthenticatedUser;
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      console.log('Authenticating request...');
      console.log('Headers:', req.headers);

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('No or invalid authorization header');
        return res.status(401).json({ message: 'No authorization token provided' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        console.error('No token found in authorization header');
        return res.status(401).json({ message: 'Invalid authorization token' });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
        console.log('Decoded token:', decoded);

        // Validate required fields
        if (!decoded.id || !decoded.email || !decoded.role) {
          console.error('Missing required fields in token:', decoded);
          return res.status(401).json({ message: 'Invalid token structure' });
        }

        (req as AuthenticatedRequest).user = decoded;
        console.log('Authentication successful:', {
          userId: decoded.id,
          role: decoded.role
        });

        return handler(req as AuthenticatedRequest, res);
      } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid token' });
      }
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({ message: 'Internal server error in authentication' });
    }
  };
}

export function withAdmin(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      console.error('API Auth Error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}
