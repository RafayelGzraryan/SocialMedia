import { NotFoundException } from "@nestjs/common";

export class ImageNotFoundException extends NotFoundException {
    constructor(error?: string) {
        super("error.image_not_found", error);
    }
}