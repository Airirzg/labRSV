import React from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export function authenticateToken(
  req: NextApiRequest & { user?: DecodedToken },
  res: NextApiResponse,
  next: NextHandler
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

export function requireAdmin(
  req: NextApiRequest & { user?: DecodedToken },
  res: NextApiResponse,
  next: NextHandler
) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}

// Helper function to check if user is authenticated on client side
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return !!decoded;
  } catch {
    return false;
  }
}

// Helper function to check if user is admin on client side
export function isAdmin() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

// Higher-order component to protect client-side routes
export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
      setIsClient(true);
    }, []);

    React.useEffect(() => {
      if (isClient && !loading && !user) {
        router.push('/auth/login');
      }
    }, [isClient, loading, user, router]);

    // Don't render anything while checking authentication
    if (!isClient || loading) {
      return <Loading fullScreen message="Checking authentication..." />;
    }

    // If not authenticated, don't render the component
    if (!user) {
      return null;
    }

    // If authenticated, render the wrapped component
    return <WrappedComponent {...props} />;
  };
}

// Higher-order component to protect admin routes
export function withAdmin<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function AdminComponent(props: P) {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
      setIsClient(true);
    }, []);

    React.useEffect(() => {
      if (isClient && !loading) {
        if (!user) {
          router.push('/auth/login');
        } else if (user.role !== 'admin') {
          router.push('/dashboard');
        }
      }
    }, [isClient, loading, user, router]);

    // Don't render anything while checking authentication
    if (!isClient || loading) {
      return <Loading fullScreen message="Checking authorization..." />;
    }

    // If not admin, don't render the component
    if (!user || user.role !== 'admin') {
      return null;
    }

    // If admin, render the wrapped component
    return <WrappedComponent {...props} />;
  };
}
