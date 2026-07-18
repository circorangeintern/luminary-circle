import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AppException } from '../common/errors/app.exception';
import { normalizePhone } from '../common/utils/phone.util';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const phone = normalizePhone(dto.phone); // throws VALIDATION_ERROR if bad

    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing) {
      throw new AppException(
        'CONFLICT',
        'This phone number already has an account',
        [{ field: 'phone', message: 'Already registered' }],
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { displayName: dto.displayName.trim(), phone, passwordHash },
      select: { id: true, displayName: true, phone: true, role: true },
    });

    return { user, accessToken: this.signToken(user.id, user.role) };
  }

  async login(dto: LoginDto) {
    let phone: string;
    try {
      phone = normalizePhone(dto.phone);
    } catch {
      throw this.invalidCredentials();
    }

    const user = await this.prisma.user.findUnique({ where: { phone } });

    const hashToCheck = user?.passwordHash ?? DUMMY_HASH;
    const passwordOk = await bcrypt.compare(dto.password, hashToCheck);

    if (!user || !passwordOk) throw this.invalidCredentials();

    if (user.accountStatus !== 'ACTIVE') {
      throw new AppException('FORBIDDEN', 'This account is not active');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        displayName: user.displayName,
        phone: user.phone,
        role: user.role,
      },
      accessToken: this.signToken(user.id, user.role),
    };
  }

  private signToken(sub: string, role: string) {
    return this.jwt.sign({ sub, role });
  }

  private invalidCredentials() {
    return new AppException(
      'AUTHENTICATION_ERROR',
      'Phone number or password is incorrect',
    );
  }
}

// A real bcrypt hash of a random string, used only to equalize timing.
const DUMMY_HASH =
  '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.PjTPRTLQvzD9pAeC3zsFYyj5FSDy';
