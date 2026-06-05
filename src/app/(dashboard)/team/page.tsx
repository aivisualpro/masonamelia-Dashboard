'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/content?tab=about-ma/meet-the-team');
  }, [router]);
  return null;
}
