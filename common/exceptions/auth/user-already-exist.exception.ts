import { PreconditionFailedException } from "@nestjs/common";

export class UserAlreadyExistException extends PreconditionFailedException {
    constructor(error?: string) {
        super("error.user_already_exist.exception", error);
    }
}