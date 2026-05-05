import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, AdminLoginDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP to customer phone' })
  async sendOtp(@Body() dto: SendOtpDto) {
    const result = await this.authService.sendOtp(dto.phone, dto.countryCode);
    return { success: true, data: result };
  }

  @Post('otp/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify OTP and login/register customer' })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyOtp(
      dto.phone, dto.countryCode, dto.otp, dto.tenantId,
    );

    this.setTokenCookies(res, result.tokens);
    return {
      success: true,
      data: {
        customer: result.customer,
        isNewCustomer: result.isNewCustomer,
      },
    };
  }

  @Post('admin/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin login with email/password' })
  async adminLogin(@Body() dto: AdminLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.adminLogin(dto.email, dto.password, dto.tenantId);
    this.setTokenCookies(res, result.tokens);
    return { success: true, data: { user: result.user } };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: { refreshToken: string }, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.refreshTokens(body.refreshToken);
    this.setTokenCookies(res, tokens);
    return { success: true, data: { message: 'Tokens refreshed' } };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout and clear tokens' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { success: true, data: { message: 'Logged out' } };
  }

  private setTokenCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
