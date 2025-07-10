import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService); // 获取 ConfigService 实例

  const port = configService.get<number>('PORT') || 4000;
  const jwtSecret = configService.get<string>('JWT_SECRET');
  const env = process.env.NODE_ENV || 'development';

  console.log('🚀 App is starting...');
  console.log(`🌍 Environment: ${env}`);
  console.log(`📦 JWT_SECRET: ${jwtSecret}`);
  console.log(`🚪 Listening on port: ${port}`);

  await app.listen(port);
}
bootstrap();
