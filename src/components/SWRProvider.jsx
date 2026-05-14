'use client';

import { SWRConfig } from 'swr';

// ─── Global SWR defaults ───────────────────────────────────────
// Applied to every useSWR call unless overridden per-hook.
const swrConfig = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60_000,        // 1 min default dedup
  keepPreviousData: true,
  errorRetryCount: 2,
  shouldRetryOnError: (err) => {
    const status = err?.status ?? err?.response?.status;
    return status !== 404 && status !== 401;
  },
};

export default function SWRProvider({ children }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
