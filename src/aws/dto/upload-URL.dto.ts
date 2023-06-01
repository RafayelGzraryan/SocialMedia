import { IsString } from 'class-validator';

export class UploadURLDto {
    @IsString()
    objectKey: string;

    @IsString()
    ContentType: string;
}
