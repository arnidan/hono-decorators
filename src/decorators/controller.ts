import 'reflect-metadata';

/**
 * Decorator that marks a class as a controller with a base path
 * @param path - The base path for all routes in this controller
 */
export function Controller(path: string = '') {
  return function (targetOrContext: Function | ClassDecoratorContext) {
    // Handle both old and new decorator syntaxes
    const target = typeof targetOrContext === 'function' 
      ? targetOrContext 
      : targetOrContext.constructor;
    
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