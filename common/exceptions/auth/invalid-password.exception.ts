import { PreconditionFailedException } from "@nestjs/common";

export class InvalidPasswordException extends PreconditionFailedException {
    constructor(error?: string) {
        super("error.invalid_password.exception", error);
    }
}