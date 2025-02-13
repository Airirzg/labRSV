import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: DecodedToken;
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      console.error('API Auth Error:', error);
      return res.status(401).json({ message: 'Invalid token' });
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

      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      
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
