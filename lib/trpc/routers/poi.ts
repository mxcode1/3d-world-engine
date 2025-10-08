// POI tRPC Router
// CRUD operations for Points of Interest

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../server";
import { supabaseFallback } from "../../supabase-fallback";

export const poiRouter = router({
  // Get all POIs with filters
  getAll: publicProcedure
    .input(z.object({
      region: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      minRating: z.number().min(0).max(5).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Use Supabase fallback in production for now
      if (process.env.NODE_ENV === 'production') {
        console.log('Using Supabase fallback in production');
        const fallbackPois = await supabaseFallback.getPOIs(input.region);
        return fallbackPois;
      }
      
      try {
        // Try Prisma first in development
        const pois = await ctx.prisma.pOI.findMany({
          where: {
            ...(input.region && { region: input.region }),
            ...(input.category && { category: input.category }),
            ...(input.tags && input.tags.length > 0 && {
              tags: {
                hasSome: input.tags,
              },
            }),
            ...(input.minRating && { rating: { gte: input.minRating } }),
          },
          include: {
            user: {
              select: {
                display_name: true,
                avatar_url: true,
              },
            },
            _count: {
              select: {
                favorites: true,
                comments: true,
              },
            },
          },
          orderBy: [
            { verified: 'desc' },
            { rating: 'desc' },
            { created_at: 'desc' },
          ],
          take: input.limit,
          skip: input.offset,
        });
        return pois;
      } catch (error) {
        // Fallback to Supabase REST API
        console.warn('Prisma connection failed, using Supabase fallback:', error);
        const fallbackPois = await supabaseFallback.getPOIs(input.region);
        return fallbackPois;
      }
    }),

  // Get POIs within map bounds
  getInBounds: publicProcedure
    .input(z.object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
      region: z.string().optional(),
      categories: z.array(z.string()).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Use Supabase fallback in production for now
      if (process.env.NODE_ENV === 'production') {
        console.log('Using Supabase fallback for getInBounds in production');
        return await supabaseFallback.getPOIs(input.region);
      }
      
      try {
        const pois = await ctx.prisma.pOI.findMany({
        where: {
          latitude: {
            gte: input.south,
            lte: input.north,
          },
          longitude: {
            gte: input.west,
            lte: input.east,
          },
          ...(input.region && { region: input.region }),
          ...(input.categories && input.categories.length > 0 && {
            category: { in: input.categories },
          }),
        },
        include: {
          user: {
            select: {
              display_name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: [
          { verified: 'desc' },
          { rating: 'desc' },
        ],
      });

      return pois;
      } catch (error) {
        // Fallback to Supabase REST API
        console.warn('Prisma connection failed, using Supabase fallback:', error);
        return await supabaseFallback.getPOIs(input.region);
      }
    }),

  // Get single POI by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Use Supabase fallback in production for now
      if (process.env.NODE_ENV === 'production') {
        console.log('Using Supabase fallback for getById in production');
        const fallbackPoi = await supabaseFallback.getPOIById(input.id);
        if (!fallbackPoi) {
          throw new Error('POI not found');
        }
        return fallbackPoi;
      }
      
      try {
        // Try Prisma first in development
        const poi = await ctx.prisma.pOI.findUnique({
          where: { id: input.id },
          include: {
            user: {
              select: {
                display_name: true,
                avatar_url: true,
                bio: true,
              },
            },
            comments: {
              include: {
                user: {
                  select: {
                    display_name: true,
                    avatar_url: true,
                  },
                },
              },
              orderBy: { created_at: 'desc' },
            },
            _count: {
              select: {
                favorites: true,
                comments: true,
              },
            },
          },
        });

        if (!poi) {
          throw new Error('POI not found');
        }

        // Increment view count
        await ctx.prisma.pOI.update({
          where: { id: input.id },
          data: { views_count: { increment: 1 } },
        });

        return poi;
      } catch (error) {
        // Fallback to Supabase REST API
        console.warn('Prisma connection failed for getById, using Supabase fallback:', error);
        const fallbackPoi = await supabaseFallback.getPOIById(input.id);
        if (!fallbackPoi) {
          throw new Error('POI not found');
        }
        return fallbackPoi;
      }
    }),

  // Create new POI (protected)
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().min(1).max(500),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      category: z.enum([
        'coworking',
        'cafe',
        'accommodation',
        'restaurant',
        'attraction',
        'event',
        'safe_zone',
        'nomad_hub',
        'other',
      ]),
      region: z.string(),
      tags: z.array(z.string()).default([]),
      metadata: z.record(z.string(), z.any()).optional(),
      photos: z.array(z.string()).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const poi = await ctx.prisma.pOI.create({
        data: {
          ...input,
          created_by: ctx.user.id,
        },
        include: {
          user: {
            select: {
              display_name: true,
              avatar_url: true,
            },
          },
        },
      });

      return poi;
    }),

  // Update POI (protected - owner or admin only)
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().min(1).max(500).optional(),
      category: z.enum([
        'coworking',
        'cafe',
        'accommodation',
        'restaurant',
        'attraction',
        'event',
        'safe_zone',
        'nomad_hub',
        'other',
      ]).optional(),
      tags: z.array(z.string()).optional(),
      metadata: z.record(z.string(), z.any()).optional(),
      photos: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if user owns the POI or is admin
      const existingPOI = await ctx.prisma.pOI.findUnique({
        where: { id },
        select: { created_by: true },
      });

      if (!existingPOI) {
        throw new Error('POI not found');
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { roles: true },
      });

      const isOwner = existingPOI.created_by === ctx.user.id;
      const isAdmin = user?.roles.includes('admin');

      if (!isOwner && !isAdmin) {
        throw new Error('You can only edit your own POIs');
      }

      const updatedPOI = await ctx.prisma.pOI.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              display_name: true,
              avatar_url: true,
            },
          },
        },
      });

      return updatedPOI;
    }),

  // Delete POI (protected - owner or admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership/admin rights (same logic as update)
      const existingPOI = await ctx.prisma.pOI.findUnique({
        where: { id: input.id },
        select: { created_by: true },
      });

      if (!existingPOI) {
        throw new Error('POI not found');
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { roles: true },
      });

      const isOwner = existingPOI.created_by === ctx.user.id;
      const isAdmin = user?.roles.includes('admin');

      if (!isOwner && !isAdmin) {
        throw new Error('You can only delete your own POIs');
      }

      await ctx.prisma.pOI.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle favorite (protected)
  toggleFavorite: protectedProcedure
    .input(z.object({ poiId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.favorite.findUnique({
        where: {
          user_id_poi_id: {
            user_id: ctx.user.id,
            poi_id: input.poiId,
          },
        },
      });

      if (existing) {
        // Remove favorite
        await ctx.prisma.favorite.delete({
          where: { id: existing.id },
        });

        // Decrement count
        await ctx.prisma.pOI.update({
          where: { id: input.poiId },
          data: { favorites_count: { decrement: 1 } },
        });

        return { favorited: false };
      } else {
        // Add favorite
        await ctx.prisma.favorite.create({
          data: {
            user_id: ctx.user.id,
            poi_id: input.poiId,
          },
        });

        // Increment count
        await ctx.prisma.pOI.update({
          where: { id: input.poiId },
          data: { favorites_count: { increment: 1 } },
        });

        return { favorited: true };
      }
    }),

  // Get user's favorites (protected)
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const favorites = await ctx.prisma.favorite.findMany({
      where: { user_id: ctx.user.id },
      include: {
        poi: {
          include: {
            user: {
              select: {
                display_name: true,
                avatar_url: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return favorites.map((fav: { poi: unknown }) => fav.poi);
  }),
});