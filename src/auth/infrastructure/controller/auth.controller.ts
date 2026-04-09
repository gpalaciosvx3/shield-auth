import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { LoginAuthUseCase } from '../../application/use-cases/login-auth.usecase';
import { RefreshAuthUseCase } from '../../application/use-cases/refresh-auth.usecase';
import { LogoutAuthUseCase } from '../../application/use-cases/logout-auth.usecase';
import { LoginRequestDto } from '../../application/dtos/request/login.request.dto';
import { LoginResponseDto } from '../../application/dtos/response/login.response.dto';
import { RefreshRequestDto } from '../../application/dtos/request/refresh.request.dto';
import { RefreshResponseDto } from '../../application/dtos/response/refresh.response.dto';
import { LogoutRequestDto } from '../../application/dtos/request/logout.request.dto';
import { LogoutResponseDto } from '../../application/dtos/response/logout.response.dto';
import { BearerTokenGuard } from '../../../common/guards/bearer-token.guard';
import { HttpConstants } from '../../../common/constants/http.constants';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginAuthUseCase,
    private readonly refreshUseCase: RefreshAuthUseCase,
    private readonly logoutUseCase: LogoutAuthUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuario y obtener tokens' })
  @ApiOkResponse({ type: LoginResponseDto })
  login(
    @Body() dto: LoginRequestDto,
    @Req() req: FastifyRequest,
  ): Promise<LoginResponseDto> {
    return this.loginUseCase.execute(dto.email, dto.password, req.ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotar refresh token y obtener nuevo access token' })
  @ApiOkResponse({ type: RefreshResponseDto })
  refresh(@Body() dto: RefreshRequestDto): Promise<RefreshResponseDto> {
    return this.refreshUseCase.execute(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BearerTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión y revocar tokens' })
  @ApiOkResponse({ type: LogoutResponseDto })
  logout(
    @Body() dto: LogoutRequestDto,
    @Req() req: FastifyRequest & Record<string, unknown>,
  ): Promise<LogoutResponseDto> {
    return this.logoutUseCase.execute(dto.refreshToken, req[HttpConstants.ACCESS_TOKEN_KEY] as string);
  }
}
