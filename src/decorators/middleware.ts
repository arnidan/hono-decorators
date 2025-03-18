import 'reflect-metadata';
import type { MiddlewareHandler } from 'hono';
import type { MiddlewareConfig } from '../types';

const MIDDLEWARE_METADATA_KEY = 'middleware:handlers';

/**
 * Decorator that adds middleware to a controller class or method
 * @param middleware - Array of middleware handlers or middleware configuration
 */
export function Middleware(middleware: MiddlewareHandler[] | MiddlewareConfig) {
  const handlers = Array.isArray(middleware) ? middleware : middleware.middleware;

  return function(
    target: any,
    propertyKeyOrContext?: string | symbol | ClassMethodDecoratorContext | ClassDecoratorContext
  ) {
    // Handle both old and new decorator syntaxes
    const isLegacyDecorator = !propertyKeyOrContext || (typeof propertyKeyOrContext !== 'object');
    const isMethodDecorator = isLegacyDecorator 
      ? typeof propertyKeyOrContext === 'string' || typeof propertyKeyOrContext === 'symbol'
      : (propertyKeyOrContext as any).kind === 'method';
    
    if (isMethodDecorator) {
      // Method decorator
      const propertyKey = isLegacyDecorator 
        ? propertyKeyOrContext as string | symbol 
        : (propertyKeyOrContext as ClassMethodDecoratorContext).name;
        
      const existingMiddleware = Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target.constructor, propertyKey) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA_KEY,
        [...existingMiddleware, ...handlers],
        target.constructor,
        propertyKey
      );
    } else {
      // Class decorator
      const existingMiddleware = Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA_KEY,
        [...existingMiddleware, ...handlers],
        target
      );
    }
  };
}

/**
 * Gets middleware handlers for a class or method
 * @param target - The class constructor or prototype
 * @param propertyKey - Optional property key for method middleware
 */
export function getMiddleware(target: any, propertyKey?: string | symbol): MiddlewareHandler[] {
  const classMiddleware = Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target) || [];
  if (!propertyKey) {
    return classMiddleware;
  }

  const methodMiddleware = Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target, propertyKey) || [];
  return [...classMiddleware, ...methodMiddleware];
}