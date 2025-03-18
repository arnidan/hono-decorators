import type { Context, MiddlewareHandler } from 'hono';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type RouteMetadata = {
  method: HttpMethod;
  path: string;
  handler: string;
  middleware?: MiddlewareHandler[];
};

/**
 * Simple container interface for dependency injection
 */
export interface Container {
  get<T>(identifier: string | symbol | Function): T;
}

export type MiddlewareConfig = {
  middleware: MiddlewareHandler[];
} 