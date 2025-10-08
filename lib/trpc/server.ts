// tRPC Server Setup
// Type-safe API layer with end-to-end TypeScript

import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { PrismaClient } from '@prisma/client';
import { supabase } from '../supabase/client';
import superjson from 'superjson';
import { ZodError } from 'zod';

// Initialize Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Create context for each request
export async function createContext(opts?: FetchCreateContextFnOptions) {
  // Get user from Supabase Auth (skip during build time)
  let user = null;
  
  try {
    // Only attempt auth in runtime environment
    if (typeof window !== 'undefined' || (opts && opts.req)) {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }
  } catch {
    // Silently handle auth errors during build
    console.warn('Auth check failed during build, continuing without user context');
  }

  return {
    prisma,
    user,
    req: opts?.req,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Ensure user is not null
    },
  });
});

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Check if user has admin role
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: { roles: true },
  });

  if (!user?.roles.includes('admin')) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  return next({ ctx });
});