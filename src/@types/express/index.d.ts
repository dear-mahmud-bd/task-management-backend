import { UserController } from 'src/user/user.controller';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserController;
      };
    }
  }
}
