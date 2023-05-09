import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private readonly sendgridService: SendgridService,
        private config: ApiConfigService,
    ) {}

    async signUp(data: SignUpDto): Promise<UserEntity> {
        const user = await this.usersService.findByEmail(data.email);
        if (user) {
            throw new BadRequestException('User with this email already exists');
        }
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash(data.password, salt);
        const email = data.email.toLowerCase();
        const createdUser = await this.usersService.create({
            ...data,
            email,
            password,
        } as CreateUserDto);
        const sending = await this.sendEmail({
            email: createdUser.email,
            subject: 'Signing Up To Social_Media',
            text: 'You have successfully signed up to Social Media app',
        });
        console.log('Sending : ', sending);
        return createdUser;
    }

    async signIn(data: SignInDto): Promise<TokenDto> {
        const user = await this.usersService.findByEmail(data.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) {
            throw new BadRequestException('Password incorrect');
        }
        const payload = { id: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    private async sendEmail(emailData) {
        console.log('Sending Email');
        try {
            console.log(emailData);
            await this.sendgridService.send({
                to: emailData.email,
                from: this.config.sendgrid.email,
                subject: emailData.subject,
                text: emailData.text,
            });
            return 'Success';
        } catch (err) {
            if (err) {
                throw new BadRequestException('Email sending Error');
            }
        }
    }
}
