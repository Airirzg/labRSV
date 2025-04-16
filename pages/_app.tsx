import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { AuthProvider } from '@/context/AuthContext';
import { store } from '@/store/store';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <SessionProvider session={pageProps.session}>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <Component {...pageProps} />
        </SessionProvider>
      </AuthProvider>
    </Provider>
  );
}
