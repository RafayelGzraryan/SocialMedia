import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOkResponse, ApiProduces, getSchemaPath } from "@nestjs/swagger";

export function ApiFileResponse(...mimeTypes: string[]) {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        type: 'string',
        format: 'binary',
      }
    }),
    ApiProduces(...mimeTypes),
  );
}

export function ApiPost() {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          text: {
            type: "string",
            format: "text",
          },
          description: {
            type: "string",
            format: "text"
          },
          file: {
            type: "string",
            format: "binary"
          }
        }
      },
    },),
  );
}



