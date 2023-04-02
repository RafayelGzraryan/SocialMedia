import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
    @ApiProperty()
    @IsString()
    @MaxLength(200)
    text: string;

    @ApiProperty({ required: false })
    @IsString()
    @MaxLength(2000)
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageKey?: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    file?: any;
}
