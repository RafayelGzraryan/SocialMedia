import { IsString, IsUrl } from 'class-validator';

export class FileDto {
    @IsString()
    objectKey: string;

    @IsUrl()
    preSignedUrl: string;
}
