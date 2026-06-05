'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

/**
 * Redirect from the old /contact-info route to the new /content?tab=contact
 */
export default function ContactInfoRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/content?tab=contact');
  }, [router]);

  return <Loader />;
}
