// Main tRPC App Router
// Combines all feature routers

import { router } from '../server';
import { poiRouter } from './poi';
import { regionRouter } from './region';

export const appRouter = router({
  poi: poiRouter,
  region: regionRouter,
});

// Export type for use in client
export type AppRouter = typeof appRouter;