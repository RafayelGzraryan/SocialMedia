import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './user.entity';
import { omit } from 'lodash';
import { PostsService } from '../posts/posts.service';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity) private usersRepo: Repository<UserEntity>,
        private postsService: PostsService,
    ) {}

    async create(data: CreateUserDto): Promise<UserEntity> {
        const user = await this.usersRepo.create(data);
        return this.usersRepo.save(user);
    }

    async findAll(email?: string): Promise<UserResponseDto[]> {
        let users: UserEntity[];
        if (email) {
            users = await this.usersRepo.find({ where: { email: email.toLowerCase() } });
        } else {
            users = await this.usersRepo.find();
        }
        return users.map((user) => omit(user, 'password'));
    }

    async findByEmail(email: string) {
        return this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
    }

    async findOne(id: number): Promise<UserResponseDto> {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return omit(user, 'password');
    }

    async update(id: number, data: UpdateUserDto, currentUser): Promise<UserResponseDto> {
        if (!currentUser) {
            throw new UnauthorizedException();
        }
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (currentUser.id !== user.id) {
            throw new ForbiddenException('You have not permissions');
        }
        try {
            if (data.password) {
                const salt = await bcrypt.genSalt();
                data.password = await bcrypt.hash(data.password, salt);
            }
            const updatedUser = Object.assign(user, data);
            const createdUser = await this.usersRepo.save(updatedUser);
            return omit(createdUser, 'password');
        } catch (err) {
            if (err) {
                console.log(err.driverError);
                throw new BadRequestException('Can`t update user');
            }
        }
    }

    async remove(id: number): Promise<UserResponseDto> {
        const user = await this.usersRepo.findOne({ where: { id }, relations: ['posts'] });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        try {
            if (user.posts.length) {
                await Promise.all(
                    user.posts.map(
                        async (post) => await this.postsService.deletePost(post.id), // TODO
                    ),
                );
            }
            const removedUser = await this.usersRepo.remove(user);
            return omit(removedUser, 'password');
        } catch (err) {
            if (err) {
                console.log(err.driverError);
                throw new BadRequestException('Can`t delete user');
            }
        }
    }
}
