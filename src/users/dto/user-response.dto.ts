import { Role } from '../../../common/enums/users.role';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: Role;
}
