import 'reflect-metadata';
import type { Hono } from 'hono';
import { getControllerMetadata } from './utils/metadata';
import type { HttpMethod, RouteMetadata, Container } from './types';

export { Controller } from './decorators/controller';
export { Get, Post, Put, Delete, Patch, Head, Options } from './decorators/routes';
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

    routes.forEach((route: RouteMetadata) => {
      const fullPath = `${basePath}${route.path}`;
      const routeHandler = instance[route.handler].bind(instance);

      // Register the route with Hono
      switch (route.method) {
        case 'GET':
          app.get(fullPath, routeHandler);
          break;
        case 'POST':
          app.post(fullPath, routeHandler);
          break;
        case 'PUT':
          app.put(fullPath, routeHandler);
          break;
        case 'DELETE':
          app.delete(fullPath, routeHandler);
          break;
        case 'PATCH':
          app.patch(fullPath, routeHandler);
          break;
        case 'HEAD':
          app.get(fullPath, routeHandler); // Use get for HEAD requests as Hono doesn't have a dedicated head method
          break;
        case 'OPTIONS':
          app.options(fullPath, routeHandler);
          break;
      }
    });
  });
} 