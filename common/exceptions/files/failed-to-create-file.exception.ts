import { PreconditionFailedException } from "@nestjs/common";

export class FailedToCreateFileException extends PreconditionFailedException {
    constructor(error?: string) {
        super("error.failed_to_create_file.exception", error);
    }
}