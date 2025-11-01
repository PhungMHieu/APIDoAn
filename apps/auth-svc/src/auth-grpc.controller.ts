import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'VerifyUser')
  async verifyUser(data: { userId: string }) {
    try {
      const user = await this.authService.validateUser(data.userId);

      if (!user) {
        return {
          exists: false,
        };
      }

      return {
        exists: true,
        email: user.email,
        username: user.username,
        roles: user.roles || [],
      };
    } catch (error) {
      return {
        exists: false,
      };
    }
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: { token: string }) {
    try {
      const payload = await this.authService.validateToken(data.token);

      return {
        valid: true,
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
        roles: payload.roles || [],
      };
    } catch (error) {
      return {
        valid: false,
      };
    }
  }
}
