import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '../common/swagger/swagger.option';
import { ApiConfigService } from '../common/config/api-config.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = await app.get(ApiConfigService);
    app.useGlobalPipes(new ValidationPipe());
    setupSwagger(app, configService);
    await app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [configService.RMQ.url],
            queue: configService.RMQ.queue,
            queueOptions: {
                durable: false,
            },
        },
    });
    await app.startAllMicroservices();
    await app.listen(configService.port);
}
bootstrap();
