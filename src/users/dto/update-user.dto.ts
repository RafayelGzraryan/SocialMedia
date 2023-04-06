import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsAlphanumeric, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../../../common/enums/users.role';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ required: false })
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsAlphanumeric()
    password?: string;

    @ApiProperty({ enum: Role, default: Role.User, required: false })
    @IsEnum(Role)
    role?: Role;
}
