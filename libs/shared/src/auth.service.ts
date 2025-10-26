import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';

export type UserRole = 'admin' | 'user' | 'guest';

export interface AuthUser {
  id: string;
  username: string;
  roles: UserRole[];
}

@Injectable()
export class AuthService {
  // Dummy user for example
  private readonly users: AuthUser[] = [
    { id: '1', username: 'admin', roles: ['admin'] },
    { id: '2', username: 'user', roles: ['user'] },
  ];

  validateUser(username: string): AuthUser | null {
    return this.users.find(user => user.username === username) || null;
  }

  login(username: string): AuthUser {
    const user = this.validateUser(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Normally, you would return a JWT token here
    return user;
  }

  checkRole(user: AuthUser, role: UserRole): boolean {
    return user.roles.includes(role);
  }

  authorize(user: AuthUser, requiredRole: UserRole): void {
    if (!this.checkRole(user, requiredRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
