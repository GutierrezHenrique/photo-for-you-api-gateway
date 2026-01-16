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
            timeout: 10000, // Aumentar timeout para 10s
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
        console.error('Auth validation error (response):', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: `${this.authServiceUrl}/auth/validate`,
        });
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new UnauthorizedException('Invalid or expired token');
        }
      } else if (error.request) {
        console.error('Auth service unavailable (no response):', {
          url: `${this.authServiceUrl}/auth/validate`,
          message: error.message,
          code: error.code,
        });
      } else {
        console.error('Auth validation error (other):', {
          message: error.message,
          stack: error.stack,
          url: `${this.authServiceUrl}/auth/validate`,
        });
      }

      // Se for erro de conexão/timeout, retornar erro mais específico
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        throw new UnauthorizedException(
          `Authentication service unavailable: ${error.message || 'Connection failed'}`,
        );
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }
}
