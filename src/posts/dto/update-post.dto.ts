import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @ApiProperty({ required: false })
    @IsString()
    @MaxLength(2000)
    text?: string;

    @ApiProperty({ required: false })
    @IsString()
    @MaxLength(2000)
    description?: string;

    @IsString()
    imageKey?: string;

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    file?: any;
}
