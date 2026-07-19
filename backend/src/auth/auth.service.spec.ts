import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// The exact string both failure paths must return. Asserting against a
// shared constant is what makes the anti-enumeration property enforceable:
// change one message and this test fails.
const INVALID_CREDENTIALS = 'Phone number or password is incorrect';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  // Real bcrypt hash of 'correctpass123', computed once for the whole suite.
  let knownHash: string;

  beforeAll(async () => {
    knownHash = await bcrypt.hash('correctpass123', 10);
  });

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        // useValue swaps the real provider for our fake. AuthService's
        // constructor asks for PrismaService and gets this object instead.
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: () => 'fake.jwt.token' } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('rejects a phone number that already has an account', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({
          displayName: 'Test',
          phone: '08031234567',
          password: 'password123',
        }),
      ).rejects.toMatchObject({ code: 'CONFLICT' });

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('never returns passwordHash in the result', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-id',
        displayName: 'Test',
        phone: '+2348031234567',
        role: 'USER',
      });

      const result = await service.register({
        displayName: 'Test',
        phone: '08031234567',
        password: 'password123',
      });

      expect(result.user).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(result)).not.toContain('$2b$'); // no bcrypt hash anywhere
      expect(result.accessToken).toBe('fake.jwt.token');
    });

    it('stores the phone number in E.164 format, not as typed', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-id',
        displayName: 'Test',
        phone: '+2348031234567',
        role: 'USER',
      });

      await service.register({
        displayName: 'Test',
        phone: '0803 123 4567', // messy input
        password: 'password123',
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ phone: '+2348031234567' }) as Record<
            string,
            unknown
          >,
        }),
      );
    });
  });

  describe('login', () => {
    it('returns the generic message when the phone is not registered', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ phone: '08031234567', password: 'correctpass123' }),
      ).rejects.toMatchObject({
        code: 'AUTHENTICATION_ERROR',
        message: INVALID_CREDENTIALS,
      });
    });

    it('returns the identical message when the password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        phone: '+2348031234567',
        displayName: 'Test',
        role: 'USER',
        accountStatus: 'ACTIVE',
        passwordHash: knownHash,
      });

      await expect(
        service.login({ phone: '08031234567', password: 'wrongpassword' }),
      ).rejects.toMatchObject({
        code: 'AUTHENTICATION_ERROR',
        message: INVALID_CREDENTIALS, // same constant as the test above
      });
    });

    it('rejects a suspended account with FORBIDDEN', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        phone: '+2348031234567',
        displayName: 'Test',
        role: 'USER',
        accountStatus: 'SUSPENDED',
        passwordHash: knownHash,
      });

      await expect(
        service.login({ phone: '08031234567', password: 'correctpass123' }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });

      expect(prisma.user.update).not.toHaveBeenCalled(); // no lastLoginAt bump
    });

    it('rejects a malformed phone on login with <chosen code>', async () => {
      await expect(
        service.login({ phone: 'not-a-number', password: 'whatever123' }),
      ).rejects.toMatchObject({
        code: 'AUTHENTICATION_ERROR',
        message: INVALID_CREDENTIALS,
      });
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });
});
