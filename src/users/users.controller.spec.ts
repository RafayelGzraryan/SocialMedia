import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '../../common/enums/users.role';
import { mockUser } from '../../common/test/mock.data';

describe('UsersController', () => {
    let controller: UsersController;
    let mockUsersService: Partial<UsersService>;

    beforeEach(async () => {
        mockUsersService = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('Should return an array of users whit provided email', async () => {
        jest.spyOn(mockUsersService, 'findAll').mockImplementation(() =>
            Promise.resolve([mockUser]),
        );
        const users = await controller.findAll(mockUser.email);
        expect(mockUsersService.findAll).toHaveBeenCalledWith(mockUser.email);
        expect(users.length).toEqual(1);
        expect(users[0]).toEqual(mockUser);
    });

    it('Should return an existing user by provided id', async () => {
        jest.spyOn(mockUsersService, 'findOne').mockImplementation(() => Promise.resolve(mockUser));
        const user = await controller.findOne('1');
        expect(user.email).toEqual('test@test.com');
        expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    });

    it('Should update a user by provided id', async () => {
        const updateUserDto = { email: 'newTest@test.ru', password: 'fdsa', role: Role.Admin };
        jest.spyOn(mockUsersService, 'update').mockImplementation(() =>
            Promise.resolve({
                id: 1,
                email: updateUserDto.email,
                role: updateUserDto.role,
            }),
        );
        const updatedUser = await controller.updateUser('1', updateUserDto, mockUser);
        expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDto, mockUser);
        expect(updatedUser.email).toEqual(updateUserDto.email);
        expect(updatedUser.role).toEqual('admin');
    });

    it('Should remove user by provided id', async () => {
        jest.spyOn(mockUsersService, 'remove').mockImplementation(() => Promise.resolve(mockUser));
        const user = await controller.removeUser('1');
        expect(mockUsersService.remove).toHaveBeenCalledWith(1);
        expect(user.email).toEqual('test@test.com');
    });
});
