// Region tRPC Router
// Region definitions and configuration

import { z } from 'zod';
import { router, publicProcedure } from '../server';

export const regionRouter = router({
  // Get all regions
  getAll: publicProcedure.query(async ({ ctx }) => {
    const regions = await ctx.prisma.region.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    return regions;
  }),

  // Get single region by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const region = await ctx.prisma.region.findUnique({
        where: { id: input.id },
      });

      return region;
    }),

  // Get POI count per region
  getStats: publicProcedure.query(async ({ ctx }) => {
    const stats = await ctx.prisma.pOI.groupBy({
      by: ['region'],
      _count: {
        id: true,
      },
    });

    return stats.map((stat: { region: string; _count: { id: number } }) => ({
      region: stat.region,
      count: stat._count.id,
    }));
  }),
});