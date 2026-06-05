'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestimonialsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/content?tab=about-ma/testimonials');
  }, [router]);
  return null;
}
