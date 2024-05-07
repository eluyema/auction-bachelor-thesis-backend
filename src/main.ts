import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
    });
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors({ origin: ['http://localhost', 'https://online-auction.com.ua'] });
    await app.listen(3000);
}
bootstrap();
