import { Body, Controller, Post } from '@nestjs/common';
import { UserEntity } from '../users/user.entity';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { TokenDto } from './dto/token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Sign Up User' })
    @ApiCreatedResponse({
        type: UserEntity,
        description: 'Created User Response',
    })
    @ApiBody({
        type: SignUpDto,
        description: 'Requirement for sign up',
    })
    @Post('signup')
    async signUp(@Body() body: SignUpDto): Promise<UserEntity> {
        return this.authService.signUp(body);
    }

    @ApiOperation({ summary: 'Sign In User' })
    @ApiOkResponse({
        type: TokenDto,
        description: 'User Bearer Token Response',
    })
    @ApiBody({
        type: SignInDto,
        description: 'Requirement for sign up',
    })
    @Post('signin')
    async signIn(@Body() body: SignInDto): Promise<TokenDto> {
        return this.authService.signIn(body);
    }
}
