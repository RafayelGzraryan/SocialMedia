import {ForbiddenException} from "@nestjs/common";

export class NoPermissionException extends ForbiddenException {
    constructor(error?: string) {
        super("error.you_do_not_have_permission", error);
    }
}