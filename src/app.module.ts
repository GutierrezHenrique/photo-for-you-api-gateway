import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProxyModule } from './proxy/proxy.module';
import { CustomThrottlerGuard } from './guards/rate-limit.guard';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000'),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ProxyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
