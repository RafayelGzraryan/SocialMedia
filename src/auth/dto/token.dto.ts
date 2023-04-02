import { IsJWT, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
    @ApiProperty()
    @IsString()
    @IsJWT()
    access_token: string;
}
