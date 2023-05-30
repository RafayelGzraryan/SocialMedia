import { PreconditionFailedException } from "@nestjs/common";

export class FailedToUploadImageException extends PreconditionFailedException {
    constructor(error?: string) {
        super("error.failed_to_upload_image.exception", error);
    }
}