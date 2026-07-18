import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Reads the client's session id from X-Session-Id, falling back to 'unknown'
 *  so a missing header can never break a product request. */
export const SessionId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    return req.headers['x-session-id'] ?? 'unknown';
  },
);
