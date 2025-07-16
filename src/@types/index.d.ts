import { User } from "../database/entities/user.entity";

declare global {
  namespace Express {
    interface User {
      id: string;
      // Add other user properties from your model
      email?: string;
      name?: string;
    }
  }
}
