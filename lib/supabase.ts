import { createClient } from '@supabase/supabase-js';

import { assertEnvValue, getEnvValue } from './env';

const supabaseUrl = assertEnvValue(
  'Supabase URL',
  'VITE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
);

const supabaseKey = assertEnvValue(
  'Supabase anonymous key',
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_KEY',
);

const serviceKey = getEnvValue(
  'SUPABASE_SERVICE_ROLE_KEY',
  'SERVICE_ROLE_KEY',
);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
  global: {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      ...(serviceKey ? { 'x-service-role-key': serviceKey } : {}),
    },
  },
});

export default supabase;
