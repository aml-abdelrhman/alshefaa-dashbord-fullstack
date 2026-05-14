// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays "fresh" for 3 minutes before a background refetch
      staleTime: 3 * 60 * 1000,
      // Keep unused cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once (avoid hammering DummyJSON)
      retry: 1,
      // Don't refetch when window regains focus (UX preference for medical app)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});