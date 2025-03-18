import 'reflect-metadata';
import type { Context } from 'hono';
import type { HttpMethod, RouteMetadata } from '../types';

type HandlerFunction = (c: Context) => any;
type RouteDecorator = (path?: string) => (
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<HandlerFunction>
) => void;

/**
 * Creates a route decorator for the specified HTTP method
 * @param method - The HTTP method for the route
 */
function createRouteDecorator(method: HttpMethod): RouteDecorator {
  return (path: string = '') => {
    return function (
      target: Object,
      propertyKey: string | symbol,
      _descriptor: TypedPropertyDescriptor<HandlerFunction>
    ) {
      // Normalize the path to ensure it starts with '/' and doesn't end with '/'
      const normalizedPath = path ? 
        (path.startsWith('/') ? path : `/${path}`).replace(/\/$/, '') :
        '';

      const routes: RouteMetadata[] = Reflect.getMetadata('controller:routes', target.constructor) || [];
      routes.push({
        method,
        path: normalizedPath,
        handler: propertyKey.toString(),
      });
      
      Reflect.defineMetadata('controller:routes', routes, target.constructor);
    };
  };
}

// HTTP method decorators
export const Get = createRouteDecorator('GET');
export const Post = createRouteDecorator('POST');
export const Put = createRouteDecorator('PUT');
export const Delete = createRouteDecorator('DELETE');
export const Patch = createRouteDecorator('PATCH');
export const Head = createRouteDecorator('HEAD');
export const Options = createRouteDecorator('OPTIONS'); 