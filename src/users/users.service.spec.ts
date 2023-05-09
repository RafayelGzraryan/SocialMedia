import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { Role } from '../../common/enums/users.role';
import { PostsService } from '../posts/posts.service';
import { PostEntity } from '../posts/post.entity';
import { mockUser } from '../../common/test/mock.data';

describe('UsersService', () => {
    let service: UsersService;
    let mockUsersRepo: Partial<Repository<UserEntity>>;
    let mockPostsService: Partial<PostsService> = {};

    beforeEach(async () => {
        mockUsersRepo = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
        };
        mockPostsService = {
            deletePost: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: mockUsersRepo,
                },
                {
                    provide: PostsService,
                    useValue: mockPostsService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Should create a user by providing dto', async () => {
        const userDto = { email: 'test@test.com', password: 'asdf', role: Role.User };
        jest.spyOn(mockUsersRepo, 'create').mockImplementation(
            () => ({ ...userDto } as UserEntity),
        );
        jest.spyOn(mockUsersRepo, 'save').mockImplementation(() =>
            Promise.resolve({
                id: 1,
                ...userDto,
            } as UserEntity),
        );
        const user = await service.create(userDto);
        expect(mockUsersRepo.create).toHaveBeenCalledWith(userDto);
        expect(mockUsersRepo.save).toHaveBeenCalledWith(userDto);
        expect(user.id).toEqual(1);
        expect(user.email).toEqual('test@test.com');
    });

    it('Should return a list of all users', async () => {
        jest.spyOn(mockUsersRepo, 'find').mockImplementation(() => Promise.resolve([mockUser]));
        const users = await service.findAll();
        expect(mockUsersRepo.find).toHaveBeenCalledWith();
        expect(users[0]).toEqual(mockUser);
    });

    it('Should return a list of users by provided email', async () => {
        const email = 'test@test.com';
        jest.spyOn(mockUsersRepo, 'find').mockImplementation(() => Promise.resolve([mockUser]));
        const users = await service.findAll(email);
        expect(mockUsersRepo.find).toHaveBeenCalledWith({ where: { email } });
        expect(users[0]).toEqual(mockUser);
    });

    it('Should return a user by given id', async () => {
        jest.spyOn(mockUsersRepo, 'findOne').mockImplementation(() => Promise.resolve(mockUser));
        const user = await service.findOne(1);
        expect(mockUsersRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(user.id).toEqual(1);
        expect(user.email).toEqual('test@test.com');
    });

    it('Should throw an Error if user by given id is nor found', async () => {
        jest.spyOn(mockUsersRepo, 'findOne').mockImplementation(() => null);
        await expect(service.findOne(1)).rejects.toThrowError(NotFoundException);
    });

    it('Should update a user with hashed password', async () => {
        const newUser = {
            id: 1,
            email: 'newTest@test.com',
            password: 'fsda',
            role: Role.Admin,
        } as UserEntity;
        jest.spyOn(mockUsersRepo, 'findOne').mockImplementation(() => Promise.resolve(mockUser));
        const salt = await bcrypt.genSalt();
        newUser.password = await bcrypt.hash(newUser.password, salt);
        jest.spyOn(mockUsersRepo, 'save').mockImplementation(() => Promise.resolve(newUser));
        const updatedUser = await service.update(1, newUser, mockUser);
        expect(mockUsersRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockUsersRepo.save).toHaveBeenCalledWith(newUser);
        expect(updatedUser.email).toEqual(newUser.email); //TODO cant`t test updated password
    });

    it('Update should throw an Error if user by given id is not found', async () => {
        const newUser = {
            id: 1,
            email: 'newTest@test.com',
            password: 'fsda',
            role: Role.Admin,
        } as UserEntity;
        jest.spyOn(mockUsersRepo, 'findOne').mockImplementation(() => null);
        await expect(service.update(1, newUser, mockUser)).rejects.toThrowError(NotFoundException);
    });

    it('Update should throw an Error if authorised user has not permissions', async () => {
        const newUser = {
            id: 1,
            email: 'newTest@test.com',
            password: 'fsda',
            role: Role.Admin,
        } as UserEntity;
        const currentUser = { id: 2 } as UserEntity;
        jest.spyOn(mockUsersRepo, 'findOne').mockImplementation(() => Promise.resolve(mockUser));
        await expect(service.update(1, newUser, currentUser)).rejects.toThrowError(
            ForbiddenException,
        );
    });

    it('Should remove a user by given id', async () => {
        const post = { id: 1, text: 'abs' } as PostEntity;
        const user = { ...mockUser, posts: [post] } as UserEntity;
        jest.spyOn(mockUsersRepo, 'findOne').mockImplementation(() => Promise.resolve(user));
        jest.spyOn(mockUsersRepo, 'remove').mockImplementation(() => Promise.resolve(user));
        jest.spyOn(mockPostsService, 'deletePost').mockImplementation(() => Promise.resolve(post));
        const removedUser = await service.remove(1);
        expect(mockUsersRepo.findOne).toHaveBeenCalledWith({
            where: { id: 1 },
            relations: ['posts'],
        });
        expect(mockUsersRepo.remove).toHaveBeenCalledWith(user);
        expect(mockPostsService.deletePost).toHaveBeenCalledWith(post.id);
        expect(removedUser.email).toEqual(user.email);
    });

    it('Remove User Should throw an Error if user by given id is not found', async () => {
        jest.spyOn(mockUsersRepo, 'findOne').mockImplementation(() => null);
        await expect(service.remove(1)).rejects.toThrowError(NotFoundException);
    });
});
