import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  async sendOtp(phone: string, countryCode: string): Promise<{ message: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { phone, countryCode, code: otp, expiresAt },
    });

    // TODO: Send SMS via configured provider
    // For development, log the OTP and include in response
    console.log(`[DEV] OTP for ${countryCode}${phone}: ${otp}`);

    const isDev = this.config.get('NODE_ENV') !== 'production';
    return {
      message: 'OTP sent successfully',
      ...(isDev && { otp }),
    };
  }

  async verifyOtp(phone: string, countryCode: string, code: string, tenantId: string) {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        countryCode,
        code,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (otpRecord.attempts >= 3) {
      throw new UnauthorizedException('Too many attempts. Request a new OTP.');
    }

    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    let customer = await this.prisma.customer.findUnique({
      where: { tenantId_phone_countryCode: { tenantId, phone, countryCode } },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          tenantId,
          phone,
          countryCode,
          firstName: '',
          lastName: '',
          qrCode: uuid(),
        },
      });
    }

    const tokens = await this.generateTokens(customer.id, tenantId, 'customer');
    return { tokens, customer, isNewCustomer: !customer.firstName };
  }

  async adminLogin(email: string, password: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, tenantId, user.role.toLowerCase());
    return { tokens, user: { ...user, passwordHash: undefined } };
  }

  async refreshTokens(refreshToken: string) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Delete used refresh token (rotation)
    await this.prisma.refreshToken.delete({ where: { id: record.id } });

    const userId = record.userId || record.customerId;
    if (!userId) throw new UnauthorizedException('Invalid token');

    // Determine role by checking which ID is set
    const role = record.userId ? 'admin' : 'customer';
    const tenantId = await this.getTenantForUser(userId, role);

    return this.generateTokens(userId, tenantId, role);
  }

  private async generateTokens(userId: string, tenantId: string, role: string) {
    const payload = { sub: userId, tenantId, role };

    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = uuid();

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        [role === 'customer' ? 'customerId' : 'userId']: userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async sendEmailVerification(customerId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer || !customer.email) {
      throw new UnauthorizedException('No email address on file');
    }

    if (customer.emailVerified) {
      return { message: 'Email already verified' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await this.prisma.customer.update({
      where: { id: customerId },
      data: { emailVerifyCode: code, emailVerifyExpiry: expiry },
    });

    // TODO: Send actual email via SendGrid/provider
    console.log(`[DEV] Email verification code for ${customer.email}: ${code}`);

    const isDev = this.config.get('NODE_ENV') !== 'production';
    return { message: 'Verification email sent', ...(isDev && { devCode: code }) };
  }

  async verifyEmail(customerId: string, code: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new UnauthorizedException('Customer not found');

    if (customer.emailVerified) return;

    if (
      !customer.emailVerifyCode ||
      customer.emailVerifyCode !== code ||
      !customer.emailVerifyExpiry ||
      customer.emailVerifyExpiry < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.prisma.customer.update({
      where: { id: customerId },
      data: { emailVerified: true, emailVerifyCode: null, emailVerifyExpiry: null },
    });
  }

  async getEmailVerificationStatus(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { emailVerified: true, email: true },
    });
    return { emailVerified: customer?.emailVerified || false, email: customer?.email };
  }

  private async getTenantForUser(userId: string, role: string): Promise<string> {
    if (role === 'customer') {
      const customer = await this.prisma.customer.findUnique({ where: { id: userId } });
      return customer?.tenantId || '';
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.tenantId || '';
  }
}
