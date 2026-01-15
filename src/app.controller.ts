import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { SkipLogging } from './common/decorators/skip-logging.decorator';

@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @SkipLogging() // Skip logging for root endpoint
  getHello(): string {
    return this.appService.getHello();
  }
}
