import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as AuthenticatedRequest;
    const userId = request.user?.id;
    return userId ? `user-${userId}` : `ip-${request.ip || 'unknown'}`;
  }

  protected async throwThrottlingException(): Promise<void> {
    throw new ThrottlerException('Too many requests. Please try again later.');
  }
}
