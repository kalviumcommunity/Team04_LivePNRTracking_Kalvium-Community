/**
 * @file route.ts
 * @description NextAuth API handler routing catch-all endpoint (GET/POST).
 * Handles authentication provider callbacks, session checks, and credentials validation queries.
 */

import { handlers } from "@/auth";

/**
 * Expose GET and POST handlers initialized in standard auth.ts configuration.
 */
export const { GET, POST } = handlers;