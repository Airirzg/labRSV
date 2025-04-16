import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/auth/login');
      }
    }, [loading, user, router]);

    if (loading) {
      return <Loading />;
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export function withAdmin<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAdminComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!user || user.role !== 'ADMIN')) {
        router.replace('/auth/login');
      }
    }, [loading, user, router]);

    if (loading) {
      return <Loading />;
    }

    if (!user || user.role !== 'ADMIN') {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
