import 'reflect-metadata';
import type { Hono } from 'hono';
import { getControllerMetadata } from './utils/metadata';
import type { HttpMethod, RouteMetadata, Container } from './types';
import { getMiddleware } from './decorators/middleware';

export { Controller } from './decorators/controller';
export { Get, Post, Put, Delete, Patch, Head, Options } from './decorators/routes';
export { Middleware } from './decorators/middleware';
export type { Container } from './types';

type Constructor<T = any> = new (...args: any[]) => T;

type RegisterControllersOptions = {
  container?: Container;
};

/**
 * Registers controller classes with a Hono application
 * @param controllers - Array of controller classes to register
 * @param app - Hono application instance
 * @param options - Optional configuration for controller registration
 */
export function registerControllers(
  controllers: Constructor[],
  app: Hono,
  options: RegisterControllersOptions = {}
) {
  controllers.forEach((Controller) => {
    // If container is provided, try to resolve the controller instance from it
    const instance = options.container
      ? options.container.get<InstanceType<typeof Controller>>(Controller)
      : new Controller();

    const { path: basePath, routes } = getControllerMetadata(Controller);

    // Get controller-level middleware
    const controllerMiddleware = getMiddleware(Controller);

    routes.forEach((route: RouteMetadata) => {
      const fullPath = `${basePath}${route.path}`;
      const routeHandler = instance[route.handler].bind(instance);

      // Combine controller and route middleware
      const middleware = [
        ...controllerMiddleware,
        ...(route.middleware || [])
      ];

      // Create the handler chain - ensure it's always an array
      const handlerChain = [...middleware, routeHandler];

      // Register the route with Hono
      switch (route.method) {
        case 'GET':
          app.get(fullPath, ...handlerChain);
          break;
        case 'POST':
          app.post(fullPath, ...handlerChain);
          break;
        case 'PUT':
          app.put(fullPath, ...handlerChain);
          break;
        case 'DELETE':
          app.delete(fullPath, ...handlerChain);
          break;
        case 'PATCH':
          app.patch(fullPath, ...handlerChain);
          break;
        case 'HEAD':
          app.get(fullPath, ...handlerChain);
          break;
        case 'OPTIONS':
          app.options(fullPath, ...handlerChain);
          break;
      }
    });
  });
} 