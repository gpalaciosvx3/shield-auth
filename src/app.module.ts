import { Module } from '@nestjs/common';
import { AuthModule } from './auth/infrastructure/bootstrap/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
