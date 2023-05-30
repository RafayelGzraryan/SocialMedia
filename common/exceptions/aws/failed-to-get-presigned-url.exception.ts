import { PreconditionFailedException } from "@nestjs/common";

export class FailedToGetPresignedUrlException extends PreconditionFailedException {
    constructor(error?: string) {
        super("error.failed_to_get_presigned_url.exception", error);
    }
}