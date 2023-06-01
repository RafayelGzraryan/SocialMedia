import { PreconditionFailedException } from "@nestjs/common";

export class FailedToDeleteImageException extends PreconditionFailedException {
    constructor(error?: string) {
        super("error.failed_to_delete_image.exception", error);
    }
}