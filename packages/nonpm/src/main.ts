import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CONFIG } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (CONFIG.CORS) {
    app.enableCors();
  }
  await app.listen(CONFIG.PORT);
}
bootstrap();
