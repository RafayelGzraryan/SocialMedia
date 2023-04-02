import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt-strategy';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { ApiConfigModule } from '../../common/config/api-config.module';
import { ApiConfigService } from '../../common/config/api-config.service';
import { SendgridService } from './sendgrid.service';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        ApiConfigModule,
        JwtModule.registerAsync({
            imports: [ApiConfigModule],
            inject: [ApiConfigService],
            useFactory: async (config: ApiConfigService) => ({
                secret: config.jwt.secret,
                signOptions: {
                    expiresIn: config.jwt.expiresIn,
                },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy, SendgridService],
    controllers: [AuthController],
})
export class AuthModule {}
