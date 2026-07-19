import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user.type';
import { SessionId } from '../common/decorators/session-id.decorator';
import { AnalyticsService } from '../analytics/analytics.service';
import { AppException } from '../common/errors/app.exception';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ErrorResponseDto } from '../common/errors/error-response.dto';

@ApiTags('auth')
@ApiHeader({
  name: 'X-Session-Id',
  required: false,
  description: 'Client session identifier, used for analytics grouping.',
})
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly analytics: AnalyticsService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Create an account and receive an access token' })
  @ApiResponse({
    status: 201,
    description: 'Account created',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Phone already registered',
    type: ErrorResponseDto,
  })
  async register(@Body() dto: RegisterDto, @SessionId() sessionId: string) {
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
        responseStatus:
          e instanceof AppException &&
          (e.code === 'CONFLICT' || e.code === 'VALIDATION_ERROR')
            ? 'VALIDATION_ERROR'
            : 'SERVER_ERROR',
        errorCode: e instanceof AppException ? e.code : 'UNKNOWN',
      });
      throw e;
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in with phone and password' })
  @ApiResponse({ status: 200, description: 'Logged in', type: AuthResponseDto })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @SessionId() sessionId: string) {
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
        responseStatus:
          e instanceof AppException && e.code === 'AUTHENTICATION_ERROR'
            ? 'AUTHENTICATION_ERROR'
            : e instanceof AppException && e.code === 'VALIDATION_ERROR'
              ? 'VALIDATION_ERROR'
              : 'SERVER_ERROR',
        errorCode: e instanceof AppException ? e.code : 'UNKNOWN',
      });

      throw e;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the current user for a stored token' })
  @ApiResponse({ status: 200, description: 'Current user' })
  @ApiResponse({
    status: 401,
    description: 'Missing, expired or invalid token',
    type: ErrorResponseDto,
  })
  me(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }
}
