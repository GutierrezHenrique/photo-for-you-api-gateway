import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ProxyService {
  private readonly authServiceUrl: string;
  private readonly galleryServiceUrl: string;
  private readonly notificationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:3001';
    this.galleryServiceUrl =
      this.configService.get<string>('GALLERY_SERVICE_URL') ||
      'http://localhost:3002';
    this.notificationServiceUrl =
      this.configService.get<string>('NOTIFICATION_SERVICE_URL') ||
      'http://localhost:3003';
  }

  async proxyToAuthService(
    method: string,
    path: string,
    data?: any,
    headers?: Record<string, string>,
    params?: any,
  ): Promise<any> {
    return this.proxyRequest(
      this.authServiceUrl,
      method,
      path,
      data,
      headers,
      params,
    );
  }

  async proxyToGalleryService(
    method: string,
    path: string,
    data?: any,
    headers?: Record<string, string>,
    params?: any,
  ): Promise<any> {
    return this.proxyRequest(
      this.galleryServiceUrl,
      method,
      path,
      data,
      headers,
      params,
    );
  }

  async proxyToNotificationService(
    method: string,
    path: string,
    data?: any,
    headers?: Record<string, string>,
    params?: any,
  ): Promise<any> {
    return this.proxyRequest(
      this.notificationServiceUrl,
      method,
      path,
      data,
      headers,
      params,
    );
  }

  private async proxyRequest(
    baseUrl: string,
    method: string,
    path: string,
    data?: any,
    headers?: Record<string, string>,
    params?: any,
  ): Promise<any> {
    const url = `${baseUrl}${path}`;
    const config: AxiosRequestConfig = {
      method: method as any,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      params,
      timeout: 30000, // 30 seconds
      maxRedirects: 0, // Não seguir redirects automaticamente
      validateStatus: (status) =>
        status < 400 || status === 302 || status === 301,
    };

    // Add data for POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
      config.data = data;
    }

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.request(config),
      );

      // Se for um redirect, retornar a localização
      if (
        (response.status === 302 || response.status === 301) &&
        response.headers.location
      ) {
        return { location: response.headers.location, redirect: true };
      }

      return response.data;
    } catch (error: any) {
      // Se for um redirect (status 302/301), retornar a localização
      if (
        error.response &&
        (error.response.status === 302 || error.response.status === 301)
      ) {
        const location = error.response.headers?.location;
        if (location) {
          return { location, redirect: true };
        }
      }

      if (error.response) {
        // Service responded with error
        throw new HttpException(
          error.response.data || error.message,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else if (error.request) {
        // Request made but no response
        throw new HttpException(
          'Service unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        // Error setting up request
        throw new HttpException(
          error.message || 'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
