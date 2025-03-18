# Hono Decorators

A TypeScript decorators package for [Hono](https://hono.dev/), specifically targeting Cloudflare Workers. This package provides a clean and intuitive way to define routes using decorators in your Hono applications.

## Features

- Class-based controllers with decorators
- Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Path normalization and validation
- TypeScript support with full type safety
- Optional dependency injection support
- Designed for Cloudflare Workers

## Installation

```bash
yarn add @hono/decorators
# or
npm install @hono/decorators
```

## Usage

Here's a basic example of how to use the decorators:

```typescript
import { Hono } from 'hono';
import { Controller, Get, Post } from '@hono/decorators';
import type { Context } from 'hono';

interface User {
  id: number;
  name: string;
}

@Controller('/users')
class UserController {
  private users: User[] = [];

  @Get('/')
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

### Using Dependency Injection

You can use dependency injection with a container that implements the `Container` interface:

```typescript
import { Container } from '@hono/decorators';

// Define your services
class UserService {
  getUsers() {
    return [/* ... */];
  }
}

// Create your controller with dependencies
@Controller('/users')
class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  async getUsers(c: Context) {
    return c.json(this.userService.getUsers());
  }
}

// Implement the Container interface
const container: Container = {
  get<T>(identifier: any): T {
    if (identifier === UserController) {
      return new UserController(new UserService()) as T;
    }
    throw new Error(`No provider for ${identifier}`);
  }
};

// Register controllers with the container
const app = new Hono();
registerControllers([UserController], app, { container });
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