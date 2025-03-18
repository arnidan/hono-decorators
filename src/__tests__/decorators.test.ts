import { Hono } from 'hono';
import { Controller, Get, Post, Middleware } from '../';
import { registerControllers } from '../';
import type { Context, MiddlewareHandler } from 'hono';
import type { Container } from '../types';

describe('Hono Decorators', () => {
  describe('Controller Decorator', () => {
    it('should register base path', () => {
      @Controller('/test')
      class TestController {}

      const metadata = Reflect.getMetadata('controller:path', TestController);
      expect(metadata).toBe('/test');
    });

    it('should normalize paths', () => {
      @Controller('test/')
      class TestController {}

      const metadata = Reflect.getMetadata('controller:path', TestController);
      expect(metadata).toBe('/test');
    });
  });

  describe('Route Decorators', () => {
    it('should register GET route', () => {
      @Controller('/api')
      class TestController {
        @Get('/users')
        getUsers(c: Context) {
          return c.json([]);
        }
      }

      const routes = Reflect.getMetadata('controller:routes', TestController);
      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual({
        method: 'GET',
        path: '/users',
        handler: 'getUsers',
      });
    });

    it('should register POST route', () => {
      @Controller('/api')
      class TestController {
        @Post('/users')
        createUser(c: Context) {
          return c.json({}, 201);
        }
      }

      const routes = Reflect.getMetadata('controller:routes', TestController);
      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual({
        method: 'POST',
        path: '/users',
        handler: 'createUser',
      });
    });
  });

  describe('Middleware', () => {
    let app: Hono;

    beforeEach(() => {
      app = new Hono();
    });

    it('should apply controller-level middleware', async () => {
      const log: string[] = [];

      const logMiddleware: MiddlewareHandler = async (c, next) => {
        log.push('before');
        await next();
        log.push('after');
      };

      @Controller('/api')
      @Middleware([logMiddleware])
      class TestController {
        @Get('/hello')
        sayHello(c: Context) {
          log.push('handler');
          return c.text('Hello, World!');
        }
      }

      registerControllers([TestController], app);
      
      const res = await app.request('/api/hello');
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('Hello, World!');
      expect(log).toEqual(['before', 'handler', 'after']);
    });

    it('should apply route-level middleware', async () => {
      const log: string[] = [];

      const routeMiddleware: MiddlewareHandler = async (c, next) => {
        log.push('route');
        await next();
      };

      @Controller('/api')
      class TestController {
        @Get('/hello')
        @Middleware([routeMiddleware])
        sayHello(c: Context) {
          log.push('handler');
          return c.text('Hello, World!');
        }
      }

      registerControllers([TestController], app);
      
      const res = await app.request('/api/hello');
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('Hello, World!');
      expect(log).toEqual(['route', 'handler']);
    });

    it('should combine controller and route middleware in correct order', async () => {
      const log: string[] = [];

      const controllerMiddleware: MiddlewareHandler = async (c, next) => {
        log.push('controller');
        await next();
      };

      const routeMiddleware: MiddlewareHandler = async (c, next) => {
        log.push('route');
        await next();
      };

      @Controller('/api')
      @Middleware([controllerMiddleware])
      class TestController {
        @Get('/hello')
        @Middleware([routeMiddleware])
        sayHello(c: Context) {
          log.push('handler');
          return c.text('Hello, World!');
        }
      }

      registerControllers([TestController], app);
      
      const res = await app.request('/api/hello');
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('Hello, World!');
      expect(log).toEqual(['controller', 'route', 'handler']);
    });
  });

  describe('Integration', () => {
    let app: Hono;

    beforeEach(() => {
      app = new Hono();
    });

    it('should handle requests correctly', async () => {
      @Controller('/api')
      class TestController {
        @Get('/hello')
        sayHello(c: Context) {
          return c.text('Hello, World!');
        }
      }

      registerControllers([TestController], app);
      
      const res = await app.request('/api/hello');
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('Hello, World!');
    });

    it('should work with container injection', async () => {
      class Service {
        getMessage() {
          return 'Hello from Service!';
        }
      }

      @Controller('/api')
      class TestController {
        constructor(private service: Service) {}

        @Get('/hello')
        sayHello(c: Context) {
          return c.text(this.service.getMessage());
        }
      }

      // Create a simple container implementation
      const container: Container = {
        get<T>(identifier: any): T {
          if (identifier === TestController) {
            return new TestController(new Service()) as T;
          }
          throw new Error(`No provider for ${identifier}`);
        }
      };

      registerControllers([TestController], app, { container });
      
      const res = await app.request('/api/hello');
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('Hello from Service!');
    });
  });
}); 