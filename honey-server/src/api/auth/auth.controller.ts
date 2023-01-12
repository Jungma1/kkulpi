import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { AppConfigService } from '~/common/config/app-config.service';
import { setTokenCookies } from '~/lib/cookies';
import { AuthService } from './auth.service';
import { AuthUser } from './decorator/auth-user.decorator';
import { AuthUserDto } from './dto/auth-user.dto';
import { GoogleGuard } from './guard/google.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { OAuthUser } from './interface/oauth-user.interface';

@Controller('auth')
export class AuthController {
  private readonly host: string;
  private readonly domain: string;

  constructor(
    private readonly authService: AuthService,
    private readonly appConfigService: AppConfigService,
  ) {
    this.host = appConfigService.host;
    this.domain = appConfigService.domain;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@AuthUser() user: User) {
    return new AuthUserDto(user);
  }

  @Get('oauth/google')
  @UseGuards(GoogleGuard)
  async google() {
    // oauth google
  }

  @Get('oauth/google/redirect')
  @UseGuards(GoogleGuard)
  async googleRedirect(@AuthUser() user: OAuthUser, @Res() res: Response) {
    const tokens = await this.authService.socialRegister(user);
    setTokenCookies(res, tokens, this.domain);
    return res.redirect(this.host);
  }
}
