export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type RouteMetadata = {
  method: HttpMethod;
  path: string;
  handler: string;
};

/**
 * Simple container interface for dependency injection
 */
export interface Container {
  get<T>(identifier: string | symbol | Function): T;
} 