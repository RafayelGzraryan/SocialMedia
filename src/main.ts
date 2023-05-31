import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '../common/swagger/swagger.option';
import { ApiConfigService } from '../common/config/api-config.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = await app.get(ApiConfigService);
    const logger: Logger = new Logger('main');
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
    await app.listen(configService.port, () => {
        logger.log(`Server is successfully running on port: ${configService.port}`);
    });
}
bootstrap();
