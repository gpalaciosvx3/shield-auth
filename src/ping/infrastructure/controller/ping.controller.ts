import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PingUseCase } from '../../application/use-cases/ping.usecase';
import { PingResponseDto } from '../../application/dtos/ping.response.dto';

@ApiTags('health')
@Controller('ping')
export class PingController {
  constructor(private readonly useCase: PingUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: PingResponseDto })
  handle(): Promise<PingResponseDto> {
    return this.useCase.execute();
  }
}
