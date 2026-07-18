import { ErrorCode } from './error-codes';

export class AppException extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = 'AppException';
    Error.captureStackTrace(this, this.constructor);
  }
}
