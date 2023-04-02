import { FileTypeValidator, ParseFilePipe } from "@nestjs/common";

export function fileValidationPipe(imageType: string) {
  return new ParseFilePipe({
    validators: [
      new FileTypeValidator({ fileType: imageType })
    ],
    fileIsRequired: false
  });
}