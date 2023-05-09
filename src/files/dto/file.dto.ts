import { IsString, IsUrl } from 'class-validator';

export class FileDto {
    @IsString()
    key: string;

    @IsUrl()
    url: string;
}
