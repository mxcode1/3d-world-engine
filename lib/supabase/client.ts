// Supabase Client - Browser-side
// Used in client components for authentication and storage

import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create Supabase client for browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper: Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  return user;
}

// Helper: Sign up with email
export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0],
      },
    },
  });

  if (error) throw error;
  return data;
}

// Helper: Sign in with email
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Helper: Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Helper: Upload photo to Supabase Storage
export async function uploadPOIPhoto(file: File, poiId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${poiId}-${Date.now()}.${fileExt}`;
  const filePath = `poi-photos/${fileName}`;

  const { error } = await supabase.storage
    .from('photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(filePath);

  return publicUrl;
}

// Helper: Delete photo from storage
export async function deletePOIPhoto(photoUrl: string) {
  // Extract path from URL
  const urlParts = photoUrl.split('/');
  const filePath = urlParts.slice(-2).join('/'); // poi-photos/filename.jpg

  const { error } = await supabase.storage
    .from('photos')
    .remove([filePath]);

  if (error) throw error;
}