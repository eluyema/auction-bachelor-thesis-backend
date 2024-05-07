import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        rawBody: true,
    });
    app.useGlobalPipes(new ValidationPipe());
    const whitelist = ['http://localhost:5173', 'https://online-auction.com.ua'];

    app.enableCors({
        origin: whitelist,
        allowedHeaders:
            'X-Requested-With, X-HTTP-Method-Override, Authorization, Content-Type, Accept, Observe',
        methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
        credentials: true,
    });
    await app.listen(3000);
}
bootstrap();
