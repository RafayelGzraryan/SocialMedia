import { INestApplication } from "@nestjs/common";
import { ApiConfigService } from "../config/api-config.service";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const setupSwagger = (app: INestApplication, config: ApiConfigService): void => {

  const option = new DocumentBuilder()
    .setTitle(config.swagger.title)
    .setDescription(config.swagger.description)
    .setVersion(config.swagger.version)
    .addBearerAuth()
    .addSecurityRequirements(config.swagger.security)
    .build();

  const document = SwaggerModule.createDocument(app, option);
  SwaggerModule.setup(config.swagger.path, app, document);
};
