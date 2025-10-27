import { createClient } from '@supabase/supabase-js';

import { getEnvValue } from './env';

const supabaseUrl = getEnvValue(
  'VITE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
);
const supabaseServiceKey = getEnvValue(
  'SUPABASE_SERVICE_ROLE_KEY',
  'SERVICE_ROLE_KEY',
);

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    },
  });
}

export default supabaseAdmin;
