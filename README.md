# Hono Decorators

A TypeScript decorators package for [Hono](https://hono.dev/), specifically targeting Cloudflare Workers. This package provides a clean and intuitive way to define routes using decorators in your Hono applications.

## Features

- Class-based controllers with decorators
- Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Path normalization and validation
- TypeScript support with full type safety
- Optional dependency injection support
- Controller and route-level middleware support
- Designed for Cloudflare Workers

## Installation

```bash
yarn add hono-decorators
# or
npm install hono-decorators
```

## Usage

Here's a basic example of how to use the decorators:

```typescript
import { Hono } from 'hono';
import { Controller, Get, Post, Middleware } from '@hono/decorators';
import type { Context, MiddlewareHandler } from 'hono';

// Define middleware
const logMiddleware: MiddlewareHandler = async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
};

const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = c.req.header('Authorization');
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
};

interface User {
  id: number;
  name: string;
}

// Apply middleware to the entire controller
@Controller('/users')
@Middleware([logMiddleware])
class UserController {
  private users: User[] = [];

  // Apply middleware to a specific route
  @Get('/')
  @Middleware([authMiddleware])
  async getUsers(c: Context) {
    return c.json(this.users);
  }

  @Get('/:id')
  async getUser(c: Context) {
    const id = Number(c.req.param('id'));
    const user = this.users.find(u => u.id === id);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json(user);
  }

  @Post('/')
  async createUser(c: Context) {
    const body = await c.req.json<Omit<User, 'id'>>();
    const newUser: User = {
      id: this.users.length + 1,
      name: body.name,
    };
    
    this.users.push(newUser);
    return c.json(newUser, 201);
  }
}

// Create Hono app and register controllers
const app = new Hono();

// Register controllers
registerControllers([UserController], app);

export default app;
```

## API Reference

### Decorators

#### @Controller(path?: string)
Marks a class as a controller and sets the base path for all routes within it.

```typescript
@Controller('/api/users')
class UserController {
  // ...
}
```

#### @Middleware(handlers: MiddlewareHandler[] | { middleware: MiddlewareHandler[] })
Applies middleware to a controller class or route method.

```typescript
// Controller-level middleware
@Controller('/api')
@Middleware([logMiddleware])
class ApiController {
  // ...
}

// Route-level middleware
@Get('/protected')
@Middleware([authMiddleware])
getProtectedResource(c: Context) {
  // ...
}
```

#### Route Decorators
- `@Get(path?: string)`
- `@Post(path?: string)`
- `@Put(path?: string)`
- `@Delete(path?: string)`
- `@Patch(path?: string)`
- `@Head(path?: string)`
- `@Options(path?: string)`

Each route decorator accepts an optional path parameter and marks a method as a route handler.

```typescript
@Get('/profile')
getProfile(c: Context) {
  return c.json({ /* ... */ });
}
```

### Helper Functions

#### registerControllers(controllers: Constructor[], app: Hono, options?: RegisterControllersOptions)
Registers an array of controller classes with a Hono application.

Options:
- `container?: Container` - Optional dependency injection container

```typescript
const app = new Hono();
registerControllers([UserController, AuthController], app, { container });
```

### Container Interface

```typescript
interface Container {
  get<T>(identifier: string | symbol | Function): T;
}
```

The container interface is simple and flexible, allowing you to use any dependency injection container that can be adapted to this interface.

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Run tests:
   ```bash
   yarn test
   ```
4. Build the package:
   ```bash
   yarn build
   ```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 