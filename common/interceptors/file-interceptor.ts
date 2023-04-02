import { UseInterceptors } from "@nestjs/common";
import { FileInterceptor,  } from "@nestjs/platform-express";
import * as dotenv from "dotenv";
dotenv.config()

export function FilesInterceptor(fieldName) {
  return UseInterceptors( FileInterceptor(fieldName,
    {
    fileFilter(
      req: any,
      file: Express.Multer.File,
      callback: (error: (Error | null), acceptFile: boolean
      ) => void) {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(null , false);
      }
      callback(null, true);
    }
  }));
}















