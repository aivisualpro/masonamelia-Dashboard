'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// ==============================|| NAVIGATION - SCROLL TO TOP ||============================== //

export default function ScrollTop({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [pathname]);

  return children || null;
}

ScrollTop.propTypes = { children: PropTypes.oneOfType([PropTypes.node, PropTypes.any]) };
