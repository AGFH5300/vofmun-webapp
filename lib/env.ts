type EnvRecord = Record<string, string | undefined>;

const collectEnvSources = (): EnvRecord[] => {
  const sources: EnvRecord[] = [];

  if (typeof globalThis !== 'undefined') {
    const globalEnv = (globalThis as typeof globalThis & {
      __env?: EnvRecord;
    }).__env;

    if (globalEnv && typeof globalEnv === 'object') {
      sources.push(globalEnv);
    }
  }

  if (typeof process !== 'undefined' && process.env) {
    sources.push(process.env as EnvRecord);
  }

  if (typeof import.meta !== 'undefined') {
    const meta = import.meta as ImportMeta & { env?: EnvRecord };
    if (meta.env) {
      sources.push(meta.env);
    }
  }

  return sources;
};

const envFromSources = Object.assign({}, ...collectEnvSources());

export const getEnvValue = (
  ...keys: string[]
): string | undefined => {
  for (const key of keys) {
    const rawValue = envFromSources[key];
    if (typeof rawValue === 'string') {
      const trimmed = rawValue.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return undefined;
};

export const assertEnvValue = (
  description: string,
  ...keys: string[]
): string => {
  const value = getEnvValue(...keys);

  if (!value) {
    throw new Error(
      `Missing environment value for ${description}. Checked keys: ${keys.join(
        ', ',
      )}`,
    );
  }

  return value;
};

