import { createClient } from '@supabase/supabase-js';

type EnvRecord = Record<string, string | undefined>;

const resolveEnv = (): EnvRecord => {
  const sources: EnvRecord[] = [];

  if (typeof process !== 'undefined' && process.env) {
    sources.push(process.env as EnvRecord);
  }

  if (typeof import.meta !== 'undefined') {
    const meta = import.meta as ImportMeta & { env?: EnvRecord };
    if (meta.env) {
      sources.push(meta.env);
    }
  }

  return Object.assign({}, ...sources);
};

const env = resolveEnv();

const supabaseUrl =
  env.VITE_SUPABASE_URL ??
  env.NEXT_PUBLIC_SUPABASE_URL ??
  env.SUPABASE_URL;

const supabaseKey =
  env.VITE_SUPABASE_ANON_KEY ??
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  env.SUPABASE_ANON_KEY ??
  env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
  global: {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  },
});

export default supabase;
