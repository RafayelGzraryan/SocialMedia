import { PreconditionFailedException } from "@nestjs/common";

export class FailedToDeleteUserException extends PreconditionFailedException {
    constructor(error?: string) {
        super("error.failed_to_delete_user.exception", error);
    }
}