import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AppException } from '../../common/errors/app.exception'
import { AuthenticatedUser } from '../types/authenticated-user.type'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T = AuthenticatedUser>(err: unknown, user: T | false): T {
    if (err || !user) {
      throw new AppException(
        'AUTHENTICATION_ERROR',
        'Please sign in to continue',
      )
    }
    return user
  }
}
