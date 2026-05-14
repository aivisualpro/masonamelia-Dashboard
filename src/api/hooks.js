import useSWR, { mutate } from 'swr';
import axios from 'axios';

// ─── Generic axios-based fetcher ────────────────────────────────
const fetcher = (url) => axios.get(url).then((res) => res.data);

const API = process.env.NEXT_PUBLIC_API_URL || '';

// ─── Per-hook config for largely-static lists (5 min dedup) ─────
const STATIC_LIST_CONFIG = {
  dedupingInterval: 300_000,   // 5 min — these lists rarely change
  revalidateIfStale: false,
  revalidateOnFocus: false,
};

// ─── Aircraft Categories ────────────────────────────────────────
export function useAircraftCategories() {
  const { data, error, isLoading, mutate: boundMutate } = useSWR(
    `${API}/api/aircraftCategories/lists`,
    fetcher,
    STATIC_LIST_CONFIG
  );
  return {
    categories: data?.data || [],
    isLoading,
    isError: error,
    mutate: boundMutate,
  };
}

// ─── Brands ─────────────────────────────────────────────────────
export function useBrands() {
  const { data, error, isLoading, mutate: boundMutate } = useSWR(
    `${API}/api/brands`,
    fetcher,
    STATIC_LIST_CONFIG
  );
  return {
    brands: data?.data || [],
    isLoading,
    isError: error,
    mutate: boundMutate,
  };
}

// ─── Teams ──────────────────────────────────────────────────────
export function useTeams() {
  const { data, error, isLoading, mutate: boundMutate } = useSWR(
    `${API}/api/teams`,
    fetcher,
    STATIC_LIST_CONFIG
  );
  return {
    members: data?.data || [],
    isLoading,
    isError: error,
    mutate: boundMutate,
  };
}

// ─── Testimonials ───────────────────────────────────────────────
export function useTestimonials() {
  const { data, error, isLoading, mutate: boundMutate } = useSWR(
    `${API}/api/testimonials`,
    fetcher,
    STATIC_LIST_CONFIG
  );
  return {
    testimonials: data?.data || [],
    isLoading,
    isError: error,
    mutate: boundMutate,
  };
}

// ─── Aircraft Counts (for categories page) ──────────────────────
export function useAircraftCounts() {
  const { data, error, isLoading, mutate: boundMutate } = useSWR(
    `${API}/api/aircrafts/lists/admin?pageSize=9999`,
    fetcher,
    STATIC_LIST_CONFIG
  );

  const counts = {};
  if (data?.data && Array.isArray(data.data)) {
    data.data.forEach((aircraft) => {
      const cat = aircraft.category;
      let catId = null;
      if (cat && typeof cat === 'object' && cat._id) {
        catId = String(cat._id);
      } else if (cat && typeof cat === 'string') {
        catId = cat;
      }
      if (catId) {
        counts[catId] = (counts[catId] || 0) + 1;
      }
    });
  }

  return { categoryCounts: counts, isLoading, isError: error, mutate: boundMutate };
}

// ─── Latest Aircraft (dashboard OrdersTable) ────────────────────
export function useLatestAircraft() {
  const { data, error, isLoading } = useSWR(
    `${API}/api/aircrafts/lists/latest`,
    fetcher,
    { dedupingInterval: 60_000 }   // 1 min — dashboard data
  );
  return {
    rows: data?.data || (Array.isArray(data) ? data : []),
    isLoading,
    isError: error,
  };
}

// ─── Contact Info ───────────────────────────────────────────────
export function useContact() {
  const { data, error, isLoading, mutate: boundMutate } = useSWR(
    `${API}/api/contact`,
    fetcher,
    STATIC_LIST_CONFIG
  );
  return {
    contact: data?.data || null,
    isLoading,
    isError: error,
    mutate: boundMutate,
  };
}
