// Database client using Supabase SDK as fallback
// This provides a working solution while we troubleshoot Prisma connection issues

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions that match Prisma API
export const db = {
  poi: {
    async findMany(options: {
      where?: {
        region?: string;
        category?: string;
        created_by?: string;
      };
      include?: {
        user?: boolean;
        favorites?: boolean;
        _count?: {
          favorites?: boolean;
          comments?: boolean;
        };
      };
    } = {}) {
      let query = supabase.from('pois').select(`
        *,
        user:users(*),
        favorites:favorites(*),
        _count:comments(count)
      `);
      
      if (options.where?.region) {
        query = query.eq('region', options.where.region);
      }
      if (options.where?.category) {
        query = query.eq('category', options.where.category);
      }
      if (options.where?.created_by) {
        query = query.eq('created_by', options.where.created_by);
      }
      
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      
      // Transform to match Prisma format
      return data?.map(poi => ({
        ...poi,
        _count: {
          favorites: poi.favorites?.length || 0,
          comments: poi._count?.[0]?.count || 0
        }
      })) || [];
    },

    async findUnique(options: {
      where: { id: string };
      include?: {
        user?: boolean;
        favorites?: boolean;
        comments?: boolean;
      };
    }) {
      const query = supabase.from('pois').select(`
        *,
        user:users(*),
        favorites:favorites(*),
        comments:comments(*, user:users(*))
      `).eq('id', options.where.id).single();
      
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      
      return data;
    },

    async create(options: {
      data: {
        name: string;
        description: string;
        latitude: number;
        longitude: number;
        category: string;
        region: string;
        created_by: string;
        rating?: number;
        tags?: string[];
        metadata?: Record<string, unknown>;
        photos?: string[];
      };
    }) {
      const { data, error } = await supabase
        .from('pois')
        .insert(options.data)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },

    async update(options: {
      where: { id: string };
      data: Partial<{
        name: string;
        description: string;
        latitude: number;
        longitude: number;
        category: string;
        rating: number;
        tags: string[];
        metadata: Record<string, unknown>;
        photos: string[];
        verified: boolean;
        views_count: number;
        favorites_count: number;
      }>;
    }) {
      const { data, error } = await supabase
        .from('pois')
        .update(options.data)
        .eq('id', options.where.id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },

    async delete(options: {
      where: { id: string };
    }) {
      const { data, error } = await supabase
        .from('pois')
        .delete()
        .eq('id', options.where.id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    }
  },

  favorite: {
    async create(options: {
      data: {
        user_id: string;
        poi_id: string;
      };
    }) {
      const { data, error } = await supabase
        .from('favorites')
        .insert(options.data)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },

    async delete(options: {
      where: {
        user_id_poi_id: {
          user_id: string;
          poi_id: string;
        };
      };
    }) {
      const { user_id, poi_id } = options.where.user_id_poi_id;
      const { data, error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user_id)
        .eq('poi_id', poi_id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },

    async findFirst(options: {
      where: {
        user_id: string;
        poi_id: string;
      };
    }) {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', options.where.user_id)
        .eq('poi_id', options.where.poi_id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return data;
    }
  },

  user: {
    async findUnique(options: {
      where: { id: string };
    }) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', options.where.id)
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },

    async create(options: {
      data: {
        id: string;
        email: string;
        display_name: string;
        avatar_url?: string;
      };
    }) {
      const { data, error } = await supabase
        .from('users')
        .insert(options.data)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    }
  }
};

export default db;