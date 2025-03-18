import { Hono } from 'hono';
import { Controller, Get, Post } from '../src';
import type { Context } from 'hono';

interface User {
  id: number;
  name: string;
}

@Controller('/users')
class UserController {
  private users: User[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ];

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
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});

// Register controllers
registerControllers([UserController], app);

export default app; 