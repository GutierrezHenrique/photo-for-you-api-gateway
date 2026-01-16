import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:3001';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Validate token with Auth Service
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/validate`,
          { token },
          {
            headers: {
              Authorization: authHeader,
            },
          },
        ),
      );

      // Attach user info to request
      request.user = response.data.user || response.data;
      return true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
