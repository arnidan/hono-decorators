import 'reflect-metadata';

/**
 * Decorator that marks a class as a controller with a base path
 * @param path - The base path for all routes in this controller
 */
export function Controller(path: string = ''): ClassDecorator {
  return function (target: Function) {
    // Normalize the path to ensure it starts with '/' and doesn't end with '/'
    const normalizedPath = path ? 
      (path.startsWith('/') ? path : `/${path}`).replace(/\/$/, '') :
      '';
    
    Reflect.defineMetadata('controller:path', normalizedPath, target);
    
    // Initialize empty routes array if not exists
    if (!Reflect.hasMetadata('controller:routes', target)) {
      Reflect.defineMetadata('controller:routes', [], target);
    }
  };
} 