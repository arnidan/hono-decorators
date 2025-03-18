import 'reflect-metadata';
import type { Context } from 'hono';
import type { HttpMethod, RouteMetadata } from '../types';
import { getMiddleware } from './middleware';

type HandlerFunction = (c: Context) => any;

/**
 * Creates a route decorator for the specified HTTP method
 * @param method - The HTTP method for the route
 */
function createRouteDecorator(method: HttpMethod) {
  return function(path: string = '') {
    return function(
      target: any,
      propertyKeyOrContext: string | symbol | ClassMethodDecoratorContext,
      descriptorOrUndefined?: TypedPropertyDescriptor<HandlerFunction>
    ) {
      // Determine if using old or new decorator syntax
      const isLegacyDecorator = typeof propertyKeyOrContext !== 'object';
      
      // Get the property key
      const propertyKey = isLegacyDecorator 
        ? propertyKeyOrContext as string | symbol
        : (propertyKeyOrContext as ClassMethodDecoratorContext).name;

      // Normalize the path to ensure it starts with '/' and doesn't end with '/'
      const normalizedPath = path ? 
        (path.startsWith('/') ? path : `/${path}`).replace(/\/$/, '') :
        '';

      const routes: RouteMetadata[] = Reflect.getMetadata('controller:routes', target.constructor) || [];
      
      // Get middleware for this route
      const middleware = getMiddleware(target.constructor, propertyKey);

      routes.push({
        method,
        path: normalizedPath,
        handler: propertyKey.toString(),
        middleware: middleware.length > 0 ? middleware : undefined
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