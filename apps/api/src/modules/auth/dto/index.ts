import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '33001234' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '+973' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '33001234' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '+973' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ description: 'Tenant ID' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@rally.app' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Tenant ID' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
