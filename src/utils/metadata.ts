import 'reflect-metadata';
import type { RouteMetadata } from '../types';

/**
 * Retrieves the controller metadata from a class
 * @param constructor - The controller class constructor
 */
export function getControllerMetadata(constructor: Function) {
  return {
    path: Reflect.getMetadata('controller:path', constructor) || '',
    routes: Reflect.getMetadata('controller:routes', constructor) || [] as RouteMetadata[],
  };
} 