import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRoleGuard } from '../../common/guards/users-role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserEntity } from './user.entity';
import { UserRoles } from '../../common/decorators/user.roles';
import { Role } from '../../common/enums/users.role';
import {
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@UseGuards(JwtAuthGuard, UsersRoleGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: 'Current User' })
    @ApiOkResponse({
        type: UserResponseDto,
        description: 'Current User Response',
    })
    @Get('current')
    currentUser(@CurrentUser() user: UserEntity): UserResponseDto {
        if (!user) {
            throw new UnauthorizedException('No User');
        }
        return user;
    }

    @ApiOperation({ summary: 'Get All Users' })
    @ApiOkResponse({
        type: UserResponseDto,
        description: 'Find All Users Response',
    })
    @Get('/')
    @ApiQuery({ name: 'email', type: 'string', required: false })
    findAll(@Query('email') email?: string): Promise<UserResponseDto[]> {
        return this.usersService.findAll(email);
    }

    @ApiOperation({ summary: 'Get User By Id' })
    @ApiOkResponse({
        type: UserResponseDto,
        description: 'Find User Response',
    })
    @ApiParam({
        name: 'id',
        description: 'Id Of The Required User',
    })
    @Get(':id')
    findOne(@Param('id') id: string): Promise<UserResponseDto> {
        return this.usersService.findOne(parseInt(id));
    }

    @ApiOperation({ summary: 'Update User' })
    @ApiCreatedResponse({
        type: UserResponseDto,
        description: 'Updated User Response',
    })
    @ApiParam({
        name: 'id',
        description: 'Id Of Updated User',
    })
    @ApiBody({
        type: UpdateUserDto,
        description: 'Update User Fields',
    })
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Req() req,
    ): Promise<UserResponseDto> {
        return this.usersService.update(parseInt(id), updateUserDto, req.user);
    }

    @ApiOperation({ summary: 'Delete User' })
    @ApiCreatedResponse({
        type: UserResponseDto,
        description: 'Deleted User Response',
    })
    @ApiParam({
        name: 'id',
        description: 'Id Of Deleted User',
    })
    @UserRoles(Role.Admin)
    @Delete(':id')
    remove(@Param('id') id: string): Promise<UserResponseDto> {
        return this.usersService.remove(parseInt(id));
    }
}
