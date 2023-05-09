import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { FilesService } from '../files/files.service';
import { FileDto } from '../files/dto/file.dto';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Order } from '../../common/enums/pagination.order';
import { OrderCondition } from '../../common/enums/order.condition';
import { UpdatePostDto } from './dto/update-post.dto';
import { assign } from 'lodash';
import { FilesEntity } from '../files/files.entity';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostEntity) private postsRepo: Repository<PostEntity>,
        private filesService: FilesService,
    ) {}

    async createPost(
        createPostDto: CreatePostDto,
        user: UserEntity,
        file?: Express.Multer.File,
    ): Promise<PostEntity> {
        let createFileDto: FileDto;
        if (file) {
            createFileDto = await this.filesService.uploadFile(file);
            createPostDto.imageKey = createFileDto.key;
        }
        try {
            const post = await this.postsRepo.create({ ...createPostDto, user: { id: user.id } });
            const createdPost = await this.postsRepo.save(post);
            if (createFileDto) {
                await this.filesService.createFile(createFileDto, createdPost.id);
            }
            return createdPost;
        } catch (err) {
            if (err) {
                throw new BadRequestException('Failed to create post');
            }
        }
    }

    async findAll(
        options: IPaginationOptions,
        order: Order,
        condition: OrderCondition,
    ): Promise<Pagination<PostEntity>> {
        const queryBuilder = await this.postsRepo.createQueryBuilder('post');
        queryBuilder.orderBy(`post.${condition}`, order);
        return paginate<PostEntity>(queryBuilder, options);
    }

    async findOne(id: number) {
        const post = await this.postsRepo.findOne({ where: { id } });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }

    async updatePost(
        id: number,
        updatePostDto: UpdatePostDto,
        currentUser: UserEntity,
        file?: Express.Multer.File,
    ): Promise<PostEntity> {
        const post = await this.postsRepo.findOne({
            where: { id },
            select: { file: { key: true }, user: { id: true } },
            relations: ['file', 'user'],
        });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        if (currentUser.id !== post.user.id) {
            throw new ForbiddenException("You don't have the permissions");
        }
        let updateFileDto: FileDto;
        if (file) {
            if (post.file) {
                await this.filesService.deleteFile(post.file.key);
            }
            updateFileDto = await this.filesService.uploadFile(file);
            updatePostDto.imageKey = updateFileDto.key;
        }
        const updatePost = assign(post, updatePostDto);
        const updatedPost = await this.postsRepo.save(updatePost);
        await this.filesService.createFile(updateFileDto, updatedPost.id);
        return updatedPost;
    }

    async deletePost(id: number): Promise<PostEntity> {
        const post = await this.postsRepo.findOne({ where: { id } });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        if (post.imageKey) {
            await this.filesService.deleteFile(post.imageKey);
        }
        return this.postsRepo.remove(post);
    }

    async publish(id: number): Promise<PostEntity> {
        const post = await this.postsRepo.findOne({ where: { id } });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        post.published = true;
        return this.postsRepo.save(post);
    }

    async getImage(id: number): Promise<Buffer> {
        const post = await this.postsRepo.findOne({ where: { id }, relations: ['file'] });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        if (!post.file) {
            throw new NotFoundException('There is no image in this post');
        }
        return this.filesService.downloadFile(post.file.key);
    }

    async deleteImage(id: number, currentUser: UserEntity): Promise<FilesEntity> {
        const post = await this.postsRepo.findOne({ where: { id }, relations: ['file', 'user'] });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        if (currentUser.role !== 'admin' && currentUser.id !== post.user.id) {
            throw new ForbiddenException("You don't have the permissions");
        }
        if (!post.file) {
            throw new NotFoundException('There is no image to delete');
        }
        post.imageKey = null;
        await this.postsRepo.save(post);
        return this.filesService.deleteFile(post.file.key);
    }
}
