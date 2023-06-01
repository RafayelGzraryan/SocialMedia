import { IsAlphanumeric, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsAlphanumeric()
    @MinLength(4)
    password: string;
}
