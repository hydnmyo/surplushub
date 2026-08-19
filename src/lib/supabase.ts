import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getRequiredEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const supabase = createClient<Database>(
  getRequiredEnv(supabaseUrl, "VITE_SUPABASE_URL"),
  getRequiredEnv(supabaseAnonKey, "VITE_SUPABASE_ANON_KEY"),
);
