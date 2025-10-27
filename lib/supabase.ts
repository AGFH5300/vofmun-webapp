import { createClient } from '@supabase/supabase-js';

type EnvSource = Record<string, string | undefined> | undefined;
type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, string | undefined>;
};

const getEnvValue = (env: EnvSource, key: string) => env?.[key];

const processEnv = typeof process !== 'undefined' ? process.env : undefined;
const importMetaEnv =
  typeof import.meta !== 'undefined'
    ? ((import.meta as ImportMetaWithEnv).env as EnvSource)
    : undefined;

const supabaseUrl =
  getEnvValue(processEnv, 'NEXT_PUBLIC_SUPABASE_URL') ??
  getEnvValue(processEnv, 'VITE_SUPABASE_URL') ??
  getEnvValue(importMetaEnv, 'VITE_SUPABASE_URL');

const supabaseKey =
  getEnvValue(processEnv, 'NEXT_PUBLIC_SUPABASE_ANON_KEY') ??
  getEnvValue(processEnv, 'VITE_SUPABASE_ANON_KEY') ??
  getEnvValue(importMetaEnv, 'VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

export default supabase;
