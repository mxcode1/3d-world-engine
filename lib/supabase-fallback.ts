// Supabase REST API fallback for when Prisma connection fails
// This provides a working data layer while we troubleshoot the PostgreSQL connection

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Simple REST client for Supabase
export async function supabaseQuery(table: string, params: Record<string, unknown> = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      'apikey': SUPABASE_ANON_KEY as string,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase query failed: ${response.statusText}`);
  }

  return response.json();
}

// POI-specific helper functions
export const supabaseFallback = {
  async getPOIs(region?: string) {
    const params: Record<string, string> = {
      'select': '*,user:users(*)'
    };
    
    if (region) {
      params['region'] = `eq.${region}`;
    }
    
    return supabaseQuery('pois', params);
  },

  async getPOIById(id: string) {
    const params = {
      'select': '*,user:users(*),comments:comments(*)',
      'id': `eq.${id}`
    };
    
    const results = await supabaseQuery('pois', params);
    return results[0] || null;
  }
};