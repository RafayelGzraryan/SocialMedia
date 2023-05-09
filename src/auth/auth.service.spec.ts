import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/users.role';
import { UserEntity } from '../users/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import { SendgridService } from './sendgrid.service';
import { ApiConfigService } from '../../common/config/api-config.service';
import { ClientResponse } from '@sendgrid/client/src/response';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { mockUser } from '../../common/test/mock.data';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';

describe('AuthService', () => {
    let service: AuthService;
    let mockUsersService: Partial<UsersService>;
    let mockJwtService: Partial<JwtService> = {};
    let mockSendgridService: Partial<SendgridService>;
    let mockConfigService: Partial<ApiConfigService>;

    beforeEach(async () => {
        mockUsersService = {
            findByEmail: jest.fn(),
            create: jest.fn(),
        };
        mockSendgridService = {
            send: jest.fn().mockImplementation(() => Promise.resolve({} as [ClientResponse, {}])),
        };

        mockConfigService = {
            sendgrid: {
                email: 'testSendGrid@test.com',
                key: 'sddsadwsad',
            },
        };
        mockJwtService = {
            sign: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: SendgridService,
                    useValue: mockSendgridService,
                },
                {
                    provide: ApiConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Should sign up the user', async () => {
        const signUpDto = {
            email: 'test@test.com',
            password: 'password',
            role: Role.Admin,
        } as SignUpDto;
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash(signUpDto.password, salt);
        const createUserDto = { ...signUpDto, password } as CreateUserDto;
        jest.spyOn(mockUsersService, 'findByEmail').mockImplementation(() => null);
        jest.spyOn(mockUsersService, 'create').mockImplementation(() =>
            Promise.resolve({
                ...createUserDto,
                id: 1,
            } as UserEntity),
        );
        jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => salt);
        const createdUser = await service.signUp(signUpDto);
        expect(mockUsersService.findByEmail).toHaveBeenCalledWith(signUpDto.email);
        expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
        expect(createdUser.id).toBe(1);
    });

    it('Should throw an error then the user sign`s up with the existing email', async () => {
        const signUpDto = { email: 'test@test.com' } as SignUpDto;
        jest.spyOn(mockUsersService, 'findByEmail').mockImplementation(() =>
            Promise.resolve(mockUser),
        );
        await expect(service.signUp(signUpDto)).rejects.toThrowError(BadRequestException);
    });

    it('Should return the access_token then the user signed in', async () => {
        const signInDto = { email: 'test@test.com', password: 'password' } as SignInDto;
        jest.spyOn(mockUsersService, 'findByEmail').mockImplementation(() =>
            Promise.resolve(mockUser),
        );
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
        jest.spyOn(mockJwtService, 'sign').mockReturnValueOnce('test-token');
        const tokenDto = await service.signIn(signInDto);
        expect(mockUsersService.findByEmail).toHaveBeenCalledWith(signInDto.email);
        expect(tokenDto.access_token).toEqual('test-token');
    });

    it('Should throw an error then the user sign`s in with non existing email', async () => {
        const signInDto = { email: 'test@test.com', password: 'password' } as SignUpDto;
        jest.spyOn(mockUsersService, 'findByEmail').mockImplementation(() => null);
        await expect(service.signIn(signInDto)).rejects.toThrowError(NotFoundException);
    });

    it('Should throw an error then the user sign`s in with incorrect password', async () => {
        const signInDto = { email: 'test@test.com', password: 'password' } as SignUpDto;
        jest.spyOn(mockUsersService, 'findByEmail').mockImplementation(() =>
            Promise.resolve(mockUser),
        );
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);
        await expect(service.signIn(signInDto)).rejects.toThrowError(BadRequestException);
    });
});
