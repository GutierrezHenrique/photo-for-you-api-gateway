import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyService } from './proxy.service';
import { AuthProxyController, UsersProxyController } from './controllers/auth-proxy.controller';
import { GalleryProxyController, PhotosProxyController } from './controllers/gallery-proxy.controller';
import { NotificationProxyController, PreferencesProxyController } from './controllers/notification-proxy.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [ProxyService],
  controllers: [
    AuthProxyController,
    UsersProxyController,
    GalleryProxyController,
    PhotosProxyController,
    NotificationProxyController,
    PreferencesProxyController,
  ],
  exports: [ProxyService],
})
export class ProxyModule {}
