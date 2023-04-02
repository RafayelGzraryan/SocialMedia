import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'aws-sdk';
import { setupSwagger } from '../common/swagger/swagger.option';
import { ApiConfigService } from '../common/config/api-config.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = await app.get(ApiConfigService);
    app.useGlobalPipes(new ValidationPipe());
    setupSwagger(app, configService);
    config.update({
        accessKeyId: configService.AWS.accessKeyId,
        secretAccessKey: configService.AWS.secretAccessKey,
        region: configService.AWS.region,
    });
    await app.listen(configService.port);
}
bootstrap();
