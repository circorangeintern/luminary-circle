export const ErrorCodes = {
  VALIDATION_ERROR: { httpStatus: 400 },
  AUTHENTICATION_ERROR: { httpStatus: 401 },
  FORBIDDEN: { httpStatus: 403 },
  NOT_FOUND: { httpStatus: 404 },
  CONFLICT: { httpStatus: 409 },
  RATE_LIMITED: { httpStatus: 429 },
  SERVER_ERROR: { httpStatus: 500 },
} as const;

export type ErrorCode = keyof typeof ErrorCodes;
