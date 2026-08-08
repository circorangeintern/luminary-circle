import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import type { SignOptions } from 'jsonwebtoken'
import { AppConfigService } from '../config/app-config.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { CaptchaService } from './captcha.service'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: {
          expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, CaptchaService],
  exports: [AuthService],
})
export class AuthModule {}
