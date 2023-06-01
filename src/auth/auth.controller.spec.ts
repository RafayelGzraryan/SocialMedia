import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { mockUser } from '../../common/test/mock.data';
import { Role } from '../../common/enums/users.role';
import { TokenDto } from './dto/token.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let mockAuthService: Partial<AuthService>;

    beforeEach(async () => {
        mockAuthService = {
            signUp: jest.fn(),
            signIn: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('Should sign up the user by provided dto', async () => {
        const signUpDto = { email: 'test@test.com', password: 'password', role: Role.Admin };
        jest.spyOn(mockAuthService, 'signUp').mockImplementation(() => Promise.resolve(mockUser));
        const user = await controller.signUp(signUpDto);
        expect(mockAuthService.signUp).toHaveBeenCalledWith(signUpDto);
        expect(user).toBe(mockUser);
    });

    it('Should sign in the user by provided dto', async () => {
        const signInDto = { email: 'test@test.com', password: 'password' };
        const token = {
            access_token: 'dfghtghjjtdf',
        } as TokenDto;
        jest.spyOn(mockAuthService, 'signIn').mockImplementation(() => Promise.resolve(token));
        const signInResponse = await controller.signIn(signInDto);
        expect(mockAuthService.signIn).toHaveBeenCalledWith(signInDto);
        expect(signInResponse).toBe(token);
    });
});
