import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Headers,
  Query,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ProxyService } from '../proxy.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('auth')
export class AuthProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.proxyService.proxyToAuthService('POST', '/auth/register', body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.proxyService.proxyToAuthService('POST', '/auth/login', body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    return this.proxyService.proxyToAuthService(
      'POST',
      '/auth/forgot-password',
      body,
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.proxyService.proxyToAuthService(
      'POST',
      '/auth/reset-password',
      body,
    );
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: any) {
    return this.proxyService.proxyToAuthService(
      'POST',
      '/auth/verify-email',
      body,
    );
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    return this.proxyService.proxyToAuthService('POST', '/auth/refresh', body);
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validate(@Request() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.proxyService.proxyToAuthService(
      'POST',
      '/auth/validate',
      { token },
      { Authorization: req.headers.authorization },
    );
  }

  @Get('google')
  async googleAuth(@Res() res: Response) {
    const authServiceUrl =
      process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    res.redirect(`${authServiceUrl}/auth/google`);
  }

  @Get('google/callback')
  async googleAuthCallback(
    @Query() query: any,
    @Res() res: Response,
    @Request() req: any,
  ) {
    // Para OAuth, o Passport precisa processar a sessão diretamente
    // Fazer proxy HTTP e capturar redirects
    const queryString = new URLSearchParams(query).toString();

    try {
      // Fazer proxy da requisição
      const response = await this.proxyService.proxyToAuthService(
        'GET',
        `/auth/google/callback?${queryString}`,
        undefined,
        {
          Cookie: req.headers.cookie || '',
          'User-Agent': req.headers['user-agent'] || '',
        },
      );

      // Se a resposta contém um redirect, seguir o redirect
      if (
        response &&
        typeof response === 'object' &&
        response.redirect &&
        response.location
      ) {
        return res.redirect(response.location);
      }

      return res.json(response);
    } catch (error: any) {
      // Se houver erro, verificar se é um redirect (status 302)
      if (error.response?.status === 302 || error.response?.status === 301) {
        const location = error.response.headers?.location;
        if (location) {
          return res.redirect(location);
        }
      }

      // Fallback: redirect direto para o auth-service
      const authServiceUrl =
        process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      return res.redirect(
        `${authServiceUrl}/auth/google/callback?${queryString}`,
      );
    }
  }

  @Post('google/login')
  async googleLogin(@Body() body: any) {
    return this.proxyService.proxyToAuthService(
      'POST',
      '/auth/google/login',
      body,
    );
  }
}

@Controller('users')
export class UsersProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Headers('authorization') auth: string) {
    return this.proxyService.proxyToAuthService('GET', '/users/me', undefined, {
      Authorization: auth,
    });
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Body() body: any, @Headers('authorization') auth: string) {
    return this.proxyService.proxyToAuthService('PATCH', '/users/me', body, {
      Authorization: auth,
    });
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToAuthService(
      'PATCH',
      '/users/me/password',
      body,
      { Authorization: auth },
    );
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@Headers('authorization') auth: string) {
    return this.proxyService.proxyToAuthService(
      'DELETE',
      '/users/me',
      undefined,
      { Authorization: auth },
    );
  }
}
