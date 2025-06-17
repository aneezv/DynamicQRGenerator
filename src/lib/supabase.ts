import { createClient } from '@supabase/supabase-js';
import type { QRType } from '../types'; // It's good practice to import this

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// THE FIX IS HERE: We pass the updated `Database` type to `createClient`.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      qr_codes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: QRType; // <-- ADDED: The type of the QR code
          short_url: string;
          original_url: string;
          scans: number;
          last_scanned: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          type: QRType; // <-- ADDED: `type` is required on insert
          short_url: string;
          original_url: string;
          scans?: number;
          last_scanned?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          type?: QRType; // <-- ADDED: `type` is optional on update
          original_url?: string;
          is_active?: boolean;
          scans?: number;
          last_scanned?: string | null;
        };
      };
      // No changes needed for the 'analytics' table
      analytics: {
        Row: {
          id: string;
          qr_code_id: string;
          scanned_at: string;
          user_agent: string | null;
          ip_address: string | null;
          country: string | null;
          city: string | null;
        };
        Insert: {
          qr_code_id: string;
          user_agent?: string | null;
          ip_address?: string | null;
          country?: string | null;
          city?: string | null;
        };
        Update: {
          user_agent?: string | null;
          ip_address?: string | null;
          country?: string | null;
          city?: string | null;
        };
      };
    };
  };
};

/**
 * STRONGLY RECOMMENDED: To avoid this problem in the future, use the Supabase CLI
 * to generate these types automatically. Once set up, you would run this command
 * after any database change:
 *
 * npx supabase gen types typescript --linked > src/lib/database.types.ts
 *
 * And your `supabase.ts` file would become much simpler.
 */