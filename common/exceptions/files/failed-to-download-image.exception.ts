import { PreconditionFailedException } from "@nestjs/common";

export class FailedToDownloadImageException extends PreconditionFailedException {
    constructor(error?: string) {
        super("error.failed_to_download_image.exception", error);
    }
}