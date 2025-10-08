// Region tRPC Router
// Region definitions and configuration

import { z } from 'zod';
import { router, publicProcedure } from '../server';

export const regionRouter = router({
  // Get all regions (distinct region values from POIs)
  getAll: publicProcedure.query(async ({ ctx }) => {
    const regions = await ctx.prisma.pOI.findMany({
      select: {
        region: true,
      },
      distinct: ['region'],
      orderBy: {
        region: 'asc',
      },
    });

    return regions.map((r: { region: string }, index: number) => ({
      id: (index + 1).toString(),
      name: r.region,
      region: r.region,
    }));
  }),

  // Get single region by name
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Since regions are stored as strings, find POIs in this region
      const poisInRegion = await ctx.prisma.pOI.findMany({
        where: { region: input.id },
        select: { region: true },
        take: 1,
      });

      if (poisInRegion.length === 0) {
        return null;
      }

      return {
        id: input.id,
        name: input.id,
        region: input.id,
      };
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