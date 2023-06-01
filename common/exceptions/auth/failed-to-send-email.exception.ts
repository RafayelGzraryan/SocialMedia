import { PreconditionFailedException } from "@nestjs/common";

export class FailedToSendEmailException extends PreconditionFailedException {
    constructor(error?: string) {
        super("error.failed_to_send_email.exception", error);
    }
}