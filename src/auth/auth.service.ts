import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { UserEntity } from '../users/user.entity';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';
import { ApiConfigService } from '../../common/config/api-config.service';
import { SendgridService } from './sendgrid.service';
import {
    UserNotFoundException,
    FailedToSendEmailException,
    UserAlreadyExistException,
    InvalidPasswordException,
} from '../../common/exceptions';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private readonly sendgridService: SendgridService,
        private config: ApiConfigService,
    ) {}

    async signUp(data: SignUpDto): Promise<UserEntity> {
        const user = await this.usersService.findByEmail(data.email);
        if (user) {
            throw new UserAlreadyExistException('User with this email already exists');
        }
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash(data.password, salt);
        const email = data.email.toLowerCase();
        const createdUser = await this.usersService.create({
            ...data,
            email,
            password,
        } as CreateUserDto);
        const sendResult = await this.sendEmail({
            email: createdUser.email,
            subject: 'Signing Up To Social_Media',
            text: 'You have successfully signed up to Social Media app',
        });
        this.logger.log('Sending : ', sendResult);
        return createdUser;
    }

    async signIn(data: SignInDto): Promise<TokenDto> {
        const user = await this.usersService.findByEmail(data.email);
        if (!user) {
            throw new UserNotFoundException('User not found');
        }
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            throw new InvalidPasswordException('Password incorrect');
        }
        const payload = { id: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    private async sendEmail(emailData) {
        this.logger.log('Sending Email');
        try {
            await this.sendgridService.send({
                to: emailData.email,
                from: this.config.sendgrid.email,
                subject: emailData.subject,
                text: emailData.text,
            });
            return 'Success';
        } catch (err) {
            this.logger.error(err.message);
            throw new FailedToSendEmailException('Failed to send email');
        }
    }
}
