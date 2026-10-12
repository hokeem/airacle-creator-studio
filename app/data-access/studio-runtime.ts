export type CapabilityState = 'live' | 'read-only' | 'demo-only' | 'unavailable';
export type StudioCapability = CapabilityState;

export type StudioRuntime = {
  mode: 'demo' | 'remote';
  capability: StudioCapability;
  apiBaseUrl?: string;
};

export type StudioFeatureStatus = {
  canRead: boolean;
  canMutate: boolean;
  persistence: 'remote' | 'demo' | 'none';
};
export type StudioCapabilities = StudioFeatureStatus;

export const featureStatusFor = (capability: StudioCapability): StudioFeatureStatus => {
  switch (capability) {
    case 'live': return { canRead: true, canMutate: true, persistence: 'remote' };
    case 'read-only': return { canRead: true, canMutate: false, persistence: 'remote' };
    case 'demo-only': return { canRead: true, canMutate: true, persistence: 'demo' };
    case 'unavailable': return { canRead: false, canMutate: false, persistence: 'none' };
  }
};

const validHttpUrl = (value: string | undefined): string | undefined => {
  if (!value?.trim()) return undefined;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
};

export type StudioEnvironment = {
  NEXT_PUBLIC_STUDIO_MODE?: string;
  NEXT_PUBLIC_CREATOR_API_URL?: string;
  NEXT_PUBLIC_STUDIO_API_BASE_URL?: string;
};

export const selectStudioRuntime = (environment: StudioEnvironment = {}): StudioRuntime => {
  const mode = environment.NEXT_PUBLIC_STUDIO_MODE?.trim().toLowerCase();
  if (mode === 'demo' || !mode) return { mode: 'demo', capability: 'demo-only' };
  if (mode !== 'remote') return { mode: 'demo', capability: 'demo-only' };
  const apiBaseUrl = validHttpUrl(environment.NEXT_PUBLIC_CREATOR_API_URL ?? environment.NEXT_PUBLIC_STUDIO_API_BASE_URL);
  return apiBaseUrl ? { mode: 'remote', capability: 'unavailable', apiBaseUrl } : { mode: 'remote', capability: 'unavailable' };
};

export const studioRuntime = selectStudioRuntime({
  NEXT_PUBLIC_STUDIO_MODE: process.env.NEXT_PUBLIC_STUDIO_MODE,
  NEXT_PUBLIC_CREATOR_API_URL: process.env.NEXT_PUBLIC_CREATOR_API_URL,
  NEXT_PUBLIC_STUDIO_API_BASE_URL: process.env.NEXT_PUBLIC_STUDIO_API_BASE_URL,
});
