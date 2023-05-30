import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { Repository } from 'typeorm';
import { PostEntity } from './post.entity';
import { FilesService } from '../files/files.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FileDto } from '../files/dto/file.dto';
import { FilesEntity } from '../files/files.entity';
import { UserEntity } from '../users/user.entity';
import { mockFile, mockPost, mockUser } from '../../common/test/mock.data';
import { getRepositoryToken } from '@nestjs/typeorm';
import { assign, omit } from 'lodash';
import { UpdatePostDto } from './dto/update-post.dto';
import { Role } from '../../common/enums/users.role';
import {ImageNotFoundException, NoPermissionException, PostNotFoundException} from "../../common/exceptions";

describe('PostsService', () => {
    let service: PostsService;
    let mockPostsRepo: Partial<Repository<PostEntity>>;
    let mockFileService: Partial<FilesService>;
    const file = { id: 1, key: mockPost.imageKey, url: 'test.url' } as FilesEntity;
    const mockFileDto = { key: mockPost.imageKey, url: 'test.url' } as FileDto;

    beforeEach(async () => {
        mockPostsRepo = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
        };
        mockFileService = {
            createFile: jest.fn(),
            uploadFile: jest.fn(() => Promise.resolve(mockFileDto)),
            downloadFile: jest.fn(),
            deleteFile: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                {
                    provide: getRepositoryToken(PostEntity),
                    useValue: mockPostsRepo,
                },
                {
                    provide: FilesService,
                    useValue: mockFileService,
                },
            ],
        }).compile();

        service = module.get<PostsService>(PostsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Should create new post by provided dto', async () => {
        const postDto = omit({ ...mockPost }, 'id') as CreatePostDto;
        jest.spyOn(mockPostsRepo, 'create').mockImplementation(
            () => ({ ...postDto } as PostEntity),
        );
        jest.spyOn(mockPostsRepo, 'save').mockImplementation(() => Promise.resolve(mockPost));
        const createdPost = await service.createPost(postDto, mockUser, mockFile);
        expect(mockFileService.uploadFile).toHaveBeenCalledWith(mockFile);
        expect(mockFileService.createFile).toHaveBeenCalledWith(mockFileDto, createdPost.id);
        expect(mockPostsRepo.create).toHaveBeenCalledWith({
            ...postDto,
            user: { id: mockUser.id },
        });
        expect(mockPostsRepo.save).toHaveBeenCalledWith(postDto);
        expect(createdPost).toBe(mockPost);
    });

    it('Should return the post by given id', async () => {
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() => Promise.resolve(mockPost));
        const post = await service.findOne(1);
        expect(mockPostsRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(post).toBe(mockPost);
    });

    it('Should throw an error if the post by given id not found', async () => {
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() => null);
        await expect(service.findOne(1)).rejects.toThrowError(PostNotFoundException);
    });

    it('Should update the post by provided dto', async () => {
        const postDto = {
            text: 'New Text',
            description: 'New description',
            imageKey: mockPost.imageKey,
        } as UpdatePostDto;
        const updatedPostDto = assign({ ...mockPost }, postDto, { user: { id: 1 } });
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() =>
            Promise.resolve(assign({ ...mockPost }, { user: { id: 1 } })),
        );
        jest.spyOn(mockPostsRepo, 'save').mockImplementation(() => Promise.resolve(updatedPostDto));
        const updatedPost = await service.updatePost(1, postDto, mockUser, mockFile);
        expect(mockFileService.uploadFile).toHaveBeenCalledWith(mockFile);
        expect(mockFileService.createFile).toHaveBeenCalledWith(mockFileDto, updatedPost.id);
        expect(mockPostsRepo.save).toHaveBeenCalledWith(updatedPostDto);
        expect(updatedPost.text).toBe(updatedPostDto.text);
    });

    it('Should throw an error if updated post by given id not found', async () => {
        const postDto = { test: 'test' } as UpdatePostDto;
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() => null);
        await expect(service.updatePost(1, postDto, mockUser)).rejects.toThrowError(
            PostNotFoundException,
        );
    });

    it('Should throw an error if the authorized user has not permissions', async () => {
        const postDto = { test: 'test' } as UpdatePostDto;
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() =>
            Promise.resolve(assign({ ...mockPost }, { user: { id: 2 } })),
        );
        await expect(service.updatePost(1, postDto, mockUser)).rejects.toThrowError(
            NoPermissionException,
        );
    });

    it('Should delete the post by given id', async () => {
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() => Promise.resolve(mockPost));
        jest.spyOn(mockPostsRepo, 'remove').mockImplementation(() => Promise.resolve(mockPost));
        const deletedPost = await service.deletePost(1);
        expect(mockPostsRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockFileService.deleteFile).toHaveBeenCalledWith(mockPost.imageKey);
        expect(mockPostsRepo.remove).toHaveBeenCalledWith(mockPost);
        expect(deletedPost).toBe(mockPost);
    });

    it('Should throw an error if deleted post not found', async () => {
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() => null);
        await expect(service.deletePost(1)).rejects.toThrowError(PostNotFoundException);
    });

    it('Should publish the post by given id', async () => {
        const publishPost = assign({ ...mockPost }, { published: true });
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() => Promise.resolve(mockPost));
        jest.spyOn(mockPostsRepo, 'save').mockImplementation(() => Promise.resolve(publishPost));
        const publishedPost = await service.publish(1);
        expect(mockPostsRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockPostsRepo.save).toHaveBeenCalledWith(publishPost);
        expect(publishedPost.published).toEqual(true);
    });

    it('Should get an image by given post id', async () => {
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() =>
            Promise.resolve(assign({ ...mockPost }, { file })),
        );
        jest.spyOn(mockFileService, 'downloadFile').mockImplementation(() =>
            Promise.resolve(mockFile.buffer),
        );
        const imageBuffer = await service.getImage(1);
        expect(mockPostsRepo.findOne).toHaveBeenCalledWith({
            where: { id: 1 },
            relations: ['file'],
        });
        expect(mockFileService.downloadFile).toHaveBeenCalledWith(file.key);
        expect(imageBuffer).toBe(mockFile.buffer);
    });

    it('GetImage Should throw an error if the post by given id not found', async () => {
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() => null);
        await expect(service.getImage(1)).rejects.toThrowError(PostNotFoundException);
    });

    it('GetImage should throw an error if the post has not an image', async () => {
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() => Promise.resolve(mockPost));
        await expect(service.getImage(1)).rejects.toThrowError(ImageNotFoundException);
    });

    it('Should delete the post image by given id', async () => {
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() =>
            Promise.resolve(assign({ ...mockPost }, { file }, { user: { ...mockUser } })),
        );
        jest.spyOn(mockFileService, 'deleteFile').mockImplementation(() => Promise.resolve(file));
        const deletedImage = await service.deleteImage(1, mockUser);
        expect(mockPostsRepo.findOne).toHaveBeenCalledWith({
            where: { id: 1 },
            relations: ['file', 'user'],
        });
        expect(mockFileService.deleteFile).toHaveBeenCalledWith(file.key);
        expect(deletedImage).toBe(file);
    });

    it('DeleteImage should throw an error if the post by given id not found', async () => {
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() => null);
        await expect(service.deleteImage(1, mockUser)).rejects.toThrowError(PostNotFoundException);
    });

    it('DeleteImage should throw an error if the post has not an image', async () => {
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() => Promise.resolve(mockPost));
        await expect(service.deleteImage(1, mockUser)).rejects.toThrowError(ImageNotFoundException);
    });

    it('DeleteImage should throw an error if authorized user has not permissions', async () => {
        const currentUser = { id: 2, role: Role.User } as UserEntity;
        jest.spyOn(mockPostsRepo, 'findOne').mockImplementation(() =>
            Promise.resolve(assign({ ...mockPost }, { file }, { user: { ...mockUser } })),
        );
        await expect(service.deleteImage(1, currentUser)).rejects.toThrowError(NoPermissionException);
    });
});
