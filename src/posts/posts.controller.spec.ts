import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostEntity } from './post.entity';
import { assign } from 'lodash';
import { createResponse } from 'node-mocks-http';
import { FilesEntity } from '../files/files.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { OrderCondition } from '../../common/enums/order.condition';
import { Order } from '../../common/enums/pagination.order';
import { mockFile, mockPost, mockUser } from '../../common/test/mock.data';

describe('PostsController', () => {
    let controller: PostsController;
    let mockPostsService: Partial<PostsService>;

    beforeEach(async () => {
        mockPostsService = {
            createPost: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
            publish: jest.fn(),
            getImage: jest.fn(),
            deleteImage: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostsController],
            providers: [
                PostsService,
                {
                    provide: PostsService,
                    useValue: mockPostsService,
                },
            ],
        }).compile();

        controller = module.get<PostsController>(PostsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('Should create the post by providing dto', async () => {
        const createPostDto = { text: 'Text', description: 'this is the test' } as PostEntity;
        jest.spyOn(mockPostsService, 'createPost').mockImplementation(() =>
            Promise.resolve(mockPost),
        );
        const newPost = await controller.createPost(createPostDto, mockFile, mockUser);
        expect(mockPostsService.createPost).toHaveBeenCalledWith(createPostDto, mockUser, mockFile);
        expect(newPost.text).toEqual(createPostDto.text);
        expect(newPost).toBe(mockPost);
    });

    it('Should return the list of all posts', async () => {
        const pagination = {
            items: [mockPost, mockPost, mockPost],
            meta: {
                totalItems: 3,
                itemCount: 3,
                itemsPerPage: 2,
                totalPages: 2,
                currentPage: 2,
            },
        } as Pagination<PostEntity>;
        jest.spyOn(mockPostsService, 'findAll').mockImplementation(() =>
            Promise.resolve(pagination),
        );
        const posts = await controller.findAll(2, 2, Order.ASC, OrderCondition.ID);
        expect(mockPostsService.findAll).toHaveBeenCalledWith(
            { page: 2, limit: 2 },
            Order.ASC,
            OrderCondition.ID,
        );
        expect(posts.meta.currentPage).toEqual(2);
        expect(posts.items[0].text).toBe(mockPost.text);
    });

    it('Should return the post by given id', async () => {
        jest.spyOn(mockPostsService, 'findOne').mockImplementation(() => Promise.resolve(mockPost));
        const post = await controller.findOne('1');
        expect(mockPostsService.findOne).toHaveBeenCalledWith(1);
        expect(post.text).toEqual(mockPost.text);
    });

    it('Should update the post by provided dto', async () => {
        const updatePostDto = {
            text: 'newText',
            description: 'New  description',
            imageKey: 'new imageKey',
        };
        jest.spyOn(mockPostsService, 'updatePost').mockImplementation(() =>
            Promise.resolve({
                id: 1,
                ...updatePostDto,
            } as PostEntity),
        );
        const updatedPost = await controller.updatePost('1', updatePostDto, mockFile, mockUser);
        expect(mockPostsService.updatePost).toHaveBeenCalledWith(
            1,
            updatePostDto,
            mockUser,
            mockFile,
        );
        expect(updatedPost.text).toEqual(updatePostDto.text);
    });

    it('Should delete the post by given id', async () => {
        jest.spyOn(mockPostsService, 'deletePost').mockImplementation(() =>
            Promise.resolve(mockPost),
        );
        const deletedPost = await controller.deletePost('1');
        expect(mockPostsService.deletePost).toHaveBeenCalledWith(1);
        expect(deletedPost.text).toEqual(mockPost.text);
    });

    it('Should publish the post by given id', async () => {
        jest.spyOn(mockPostsService, 'publish').mockImplementation(() =>
            Promise.resolve(assign({ ...mockPost }, { published: true })),
        );
        const publishedPost = await controller.publishPost('1');
        expect(mockPostsService.publish).toHaveBeenCalledWith(1);
        expect(publishedPost.published).toEqual(true);
    });

    it('Should get the post image by given id', async () => {
        const mockResponse = createResponse();
        jest.spyOn(mockPostsService, 'getImage').mockImplementation(() =>
            Promise.resolve(mockFile.buffer),
        );
        const streamableFile = await controller.getPostImage('1', mockResponse);
        expect(mockPostsService.getImage).toHaveBeenCalledWith(1);
        expect(streamableFile).toHaveProperty('stream');
    });

    it('Should delete post image by given id', async () => {
        const imageFile = { id: 1, key: 'object key', url: 'preSigned Url' } as FilesEntity;
        jest.spyOn(mockPostsService, 'deleteImage').mockImplementation(() =>
            Promise.resolve(imageFile),
        );
        const deletedImage = await controller.deletePostImage('1', mockUser);
        expect(mockPostsService.deleteImage).toHaveBeenCalledWith(1, mockUser);
        expect(deletedImage.key).toBe(imageFile.key);
    });
});
