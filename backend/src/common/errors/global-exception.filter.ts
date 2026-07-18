import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ErrorCode, ErrorCodes } from './error-codes';
import { AppException } from './app.exception';

interface PrismaKnownError {
  code: string;
  message: string;
  meta?: Record<string, unknown>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const { code, message, details } = this.translate(exception);
    const httpStatus = ErrorCodes[code].httpStatus;

    if (code === 'SERVER_ERROR') {
      this.logger.error(
        `${req.method} ${req.url} -> 500`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${req.method} ${req.url} -> ${httpStatus} ${code}: ${message}`,
      );
    }

    res.status(httpStatus).json({
      success: false,
      error: { code, message, ...(details && { details }) },
    });
  }

  private translate(exception: unknown): {
    code: ErrorCode;
    message: string;
    details?: { field: string; message: string }[];
  } {
    // 1) if it's AppException which is the apps custom exception
    if (exception instanceof AppException) {
      return {
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    // 2) if it's a Prisma known error
    if (this.isPrismaKnownError(exception)) {
      switch (exception.code) {
        case 'P2002': // unique constraint
          return {
            code: 'CONFLICT',
            message: 'A record with this value already exists',
          };
        case 'P2025':
          return {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found',
          };
        default:
          this.logger.error(
            `Unmapped Prisma error ${exception.code}`,
            exception.message,
          );
          return {
            code: 'SERVER_ERROR',
            message: 'Something went wrong on our end',
          };
      }
    }

    // 3) if it's nestjs exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const map: Record<number, ErrorCode> = {
        400: 'VALIDATION_ERROR',
        401: 'AUTHENTICATION_ERROR',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        409: 'CONFLICT',
        429: 'RATE_LIMITED',
      };
      return {
        code: map[status] ?? 'SERVER_ERROR',
        message: exception.message,
      };
    }

    // 4) all other exceptions
    return { code: 'SERVER_ERROR', message: 'Something went wrong on our end' };
  }

  private isPrismaKnownError(e: unknown): e is PrismaKnownError {
    return (
      typeof e === 'object' &&
      e !== null &&
      e.constructor?.name === 'PrismaClientKnownRequestError' &&
      'code' in e &&
      typeof e.code === 'string'
    );
  }
}
