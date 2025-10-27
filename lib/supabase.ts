import { createClient } from '@supabase/supabase-js';

type EnvSource = Record<string, string | undefined> | undefined;

type ImportMetaEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
} & Record<string, string | undefined>;

type ImportMetaWithEnv = ImportMeta & {
  env?: ImportMetaEnv;
};

const processEnv: EnvSource =
  typeof process !== 'undefined' ? (process.env as EnvSource) : undefined;

const importMetaEnv: ImportMetaEnv | undefined =
  typeof import.meta !== 'undefined'
    ? (import.meta as ImportMetaWithEnv).env
    : undefined;

const supabaseUrl =
  processEnv?.VITE_SUPABASE_URL ??
  processEnv?.NEXT_PUBLIC_SUPABASE_URL ??
  importMetaEnv?.VITE_SUPABASE_URL ??
  importMetaEnv?.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  processEnv?.VITE_SUPABASE_ANON_KEY ??
  processEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  importMetaEnv?.VITE_SUPABASE_ANON_KEY ??
  importMetaEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

export default supabase;
