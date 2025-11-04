import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, ip: string) {
    const { loginId, password } = loginDto;

    const user = await this.prisma.account.findUnique({
      where: { loginId },
      select: {
        id: true,
        loginId: true,
        password: true,
        firstName: true,
        lastName: true,
        status: true,
        lastLogin: true,
        lastLoginFrom: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is locked');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign(
      {
        id: user.id,
        loginId: user.loginId,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET,
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
      },
    );

    await this.prisma.account.update({
      where: { id: user.id },
      data: {
        lastLogin: Math.floor(Date.now() / 1000),
        lastLoginFrom: ip || 'unknown',
      },
    });

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          loginId: user.loginId,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    };
  }

  async validateToken(user: any) {
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          loginId: user.loginId,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
        },
      },
    };
  }
}

