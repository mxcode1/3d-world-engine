// tRPC Query Optimization Settings
// Add to your tRPC client configuration

export const TRPC_QUERY_CONFIG = {
  queries: {
    // Cache POI data for 5 minutes
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    
    // Retry failed queries
    retry: (failureCount: number, error: unknown) => {
      if (error && typeof error === 'object' && 'data' in error && 
          error.data && typeof error.data === 'object' && 'code' in error.data && 
          error.data.code === 'NOT_FOUND') return false;
      return failureCount < 3;
    },
    
    // Refetch options
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  },
  
  // Batch multiple queries
  batch: {
    enabled: true,
    batchWindow: 10, // ms
  },
  
  // Enable deduplication
  deduplication: true,
};

// Optimized query keys for better caching
export const queryKeys = {
  pois: {
    all: ['pois'] as const,
    lists: () => [...queryKeys.pois.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.pois.lists(), filters] as const,
    details: () => [...queryKeys.pois.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.pois.details(), id] as const,
  },
  regions: {
    all: ['regions'] as const,
    detail: (region: string) => [...queryKeys.regions.all, region] as const,
  },
};