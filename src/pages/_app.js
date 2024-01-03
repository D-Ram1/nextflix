import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Loading from '../components/loading/loading';

import { magic } from '../lib/magic-client';

import '@/styles/globals.css';

import { Roboto_Slab } from 'next/font/google';


const robotoSlab = Roboto_Slab({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const isLoggedIn = await magic.user.isLoggedIn();

      if (isLoggedIn) {
        router.push('/');
      } else {
        router.push('/login');
      };
    };
    checkLogin();
  }, []);

  useEffect(() => {
    const handleComplete = () => {
      setIsLoading(false);
    };

    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);


  return (
    isLoading ? <Loading /> :
      <main className={robotoSlab.className}>
        <Component {...pageProps} />
      </main>
  );
};
