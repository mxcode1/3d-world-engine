// tRPC Client
// Used in client components to make type-safe API calls

'use client';

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import superjson from 'superjson';
import type { AppRouter } from './routers';

export const trpc = createTRPCReact<AppRouter>();

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative URL
    return '';
  }
  // SSR should use vercel URL  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Dev SSR should use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [trpcClient] = React.useState(() => {
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    });
  });

  // Use React.createElement to avoid JSX parsing issues  
  const TRPCProviderComponent = trpc.Provider as React.ComponentType<{
    client: unknown;
    queryClient: unknown;
  }>;

  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(
      TRPCProviderComponent,
      { 
        client: trpcClient, 
        queryClient: queryClient,
      },
      children
    )
  );
}