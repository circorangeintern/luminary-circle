import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user.type';
import { SessionId } from '../common/decorators/session-id.decorator';
import { AnalyticsService } from '../analytics/analytics.service';
import { AppException } from '../common/errors/app.exception';
import e from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly analytics: AnalyticsService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @SessionId() sessionId: string,
  ) {
    try {
      const result = await this.auth.register(dto);
      this.analytics.emit({
        name: 'signup_completed',
        sessionId,
        userId: result.user.id,
        responseStatus: 'SUCCESS',
      });
      return result;
    } catch (e) {
      this.analytics.emit({
        name: 'signup_failed',
        sessionId,
        responseStatus: e instanceof AppException && e.code === 'CONFLICT'
          ? 'VALIDATION_ERROR'
          : 'SERVER_ERROR',
        errorCode: e instanceof AppException ? e.code : 'UNKNOWN',
      });
      throw e;
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @SessionId() sessionId: string,
  ) {
    try {
      const result = await this.auth.login(dto);
      this.analytics.emit({
        name: 'login_completed',
        sessionId,
        userId: result.user.id,
        responseStatus: 'SUCCESS',
      });

      return result;
    } catch (e) {
      this.analytics.emit({
        name: 'login_failed',
        sessionId,
        responseStatus: e instanceof AppException && e.code === 'CONFLICT'
          ? 'VALIDATION_ERROR'
          : 'SERVER_ERROR',
        errorCode: e instanceof AppException ? e.code : 'UNKNOWN',
      });
      
      throw e;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    const { id, displayName, phone, role } = user;
    return { user: { id, displayName, phone, role } };
  }
}