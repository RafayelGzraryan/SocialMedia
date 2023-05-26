import { Injectable } from "@nestjs/common";

@Injectable()
export class ApiConfigService {
  swagger = {
    title: process.env.SWAGGER_TITLE,
    description: process.env.SWAGGER_DESCRIPTION,
    version: process.env.SWAGGER_VERSION,
    security: process.env.SWAGGER_SECURITY,
    path: process.env.SWAGGER_PATH,
  };

  jwt = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
  };

  sendgrid = {
    key: process.env.SENDGRID_API_KEY,
    email: process.env.SENDGRID_EMAIL
  }

  AWS = {
    bucketName: process.env.ASW_BUCKET_NAME,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    expires: parseInt(process.env.AWS_EXPIRES),
    signatureVersion: process.env.AWS_SIGNATURE_VERSION
  }

  RMQ = {
    url: process.env.RMQ_URL,
    queue: process.env.RMQ_QUEUE
  }

  port: number = parseInt(process.env.API_PORT);
}
