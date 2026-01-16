import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ProxyService } from '../proxy.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @Headers('authorization') auth: string,
    @Param() params: any,
  ) {
    return this.proxyService.proxyToNotificationService(
      'GET',
      '/notifications',
      undefined,
      { Authorization: auth },
      params,
    );
  }

  @Get('unread')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Headers('authorization') auth: string) {
    return this.proxyService.proxyToNotificationService(
      'GET',
      '/notifications/unread',
      undefined,
      { Authorization: auth },
    );
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToNotificationService(
      'PATCH',
      `/notifications/${id}/read`,
      undefined,
      { Authorization: auth },
    );
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Headers('authorization') auth: string) {
    return this.proxyService.proxyToNotificationService(
      'PATCH',
      '/notifications/read-all',
      undefined,
      { Authorization: auth },
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNotification(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToNotificationService(
      'DELETE',
      `/notifications/${id}`,
      undefined,
      { Authorization: auth },
    );
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteAllNotifications(@Headers('authorization') auth: string) {
    return this.proxyService.proxyToNotificationService(
      'DELETE',
      '/notifications',
      undefined,
      { Authorization: auth },
    );
  }

  @Post('fcm/register')
  @UseGuards(JwtAuthGuard)
  async registerFcmToken(
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToNotificationService(
      'POST',
      '/notifications/fcm/register',
      body,
      { Authorization: auth },
    );
  }

  @Delete('fcm/token')
  @UseGuards(JwtAuthGuard)
  async removeFcmToken(
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToNotificationService(
      'DELETE',
      '/notifications/fcm/token',
      body,
      { Authorization: auth },
    );
  }

  @Post('fcm/test')
  @UseGuards(JwtAuthGuard)
  async testPushNotification(
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToNotificationService(
      'POST',
      '/notifications/fcm/test',
      body,
      { Authorization: auth },
    );
  }
}

@Controller('preferences')
export class PreferencesProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPreferences(@Headers('authorization') auth: string) {
    return this.proxyService.proxyToNotificationService(
      'GET',
      '/preferences',
      undefined,
      { Authorization: auth },
    );
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updatePreferences(
    @Body() body: any,
    @Headers('authorization') auth: string,
  ) {
    return this.proxyService.proxyToNotificationService(
      'PATCH',
      '/preferences',
      body,
      { Authorization: auth },
    );
  }
}
