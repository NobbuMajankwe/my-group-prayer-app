/**
 * aiClient.ts — Lazy AI client for Amplify Gen 2 generations.
 *
 * The client must be created AFTER Amplify.configure() runs in main.tsx.
 * We create it lazily on first use so module-level imports don't fail.
 */

import { generateClient } from 'aws-amplify/api';
import { Amplify }        from 'aws-amplify';
import type { Schema }    from '../../amplify/data/resource';

/* eslint-disable @typescript-eslint/no-explicit-any */

type AiClient = ReturnType<typeof generateClient<Schema>>;

let aiClient: AiClient | null = null;

/**
 * True when Amplify has been configured with a real AppSync endpoint.
 * Use this to decide whether to render AI buttons at all.
 */
export function isAiAvailable(): boolean {
  try {
    const config: any = (Amplify as any).getConfig?.() ?? {};
    const url: string =
      config?.API?.GraphQL?.endpoint ??
      config?.data?.url ??
      '';
    return Boolean(url && !url.startsWith('REPLACE'));
  } catch {
    return false;
  }
}

/**
 * Returns the lazy AI client. Creates it on first call (after Amplify is configured).
 */
export function getAiClient(): AiClient {
  if (!aiClient) {
    aiClient = generateClient<Schema>();
  }
  return aiClient;
}
