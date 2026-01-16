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

    // Permitir requisições OPTIONS (preflight) sem autenticação
    if (request.method === 'OPTIONS') {
      return true;
    }

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
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          },
        ),
      );

      // Check if token is valid
      if (!response.data?.valid || !response.data?.user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Attach user info to request
      request.user = response.data.user;
      return true;
    } catch (error: any) {
      // Log do erro para debug
      if (error.response) {
        console.error('Auth validation error:', {
          status: error.response.status,
          data: error.response.data,
          url: `${this.authServiceUrl}/auth/validate`,
        });
      } else if (error.request) {
        console.error('Auth service unavailable:', this.authServiceUrl);
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
