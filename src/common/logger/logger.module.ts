import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createLoggerConfig } from './logger.config';
import { AppLoggerService } from './logger.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot(createLoggerConfig()),
  ],
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}

