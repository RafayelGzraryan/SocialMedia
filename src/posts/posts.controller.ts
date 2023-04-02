import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Res,
    StreamableFile,
    UploadedFile,
    UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersRoleGuard } from '../../common/guards/users-role.guard';
import { FilesInterceptor } from '../../common/interceptors/file-interceptor';
import { fileValidationPipe } from '../../common/decorators/upload-files';
import { CurrentUser } from '../../common/decorators/current-user';
import { UserEntity } from '../users/user.entity';
import { UserRoles } from '../../common/decorators/user.roles';
import { Role } from '../../common/enums/users.role';
import { Response } from 'express';
import {
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { PostEntity } from './post.entity';
import { ApiFileResponse } from '../../common/swagger/swagger.decorators';
import { FilesService } from '../files/files.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Order } from '../../common/enums/pagination.order';
import { OrderCondition } from '../../common/enums/order.condition';

@ApiTags('Posts')
@UseGuards(JwtAuthGuard, UsersRoleGuard)
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService, private filesService: FilesService) {}

    @ApiOperation({ summary: 'Create Post' })
    @ApiCreatedResponse({
        type: PostEntity,
        description: 'Created Post Response',
    })
    @ApiConsumes('multipart/form-data')
    @FilesInterceptor('file')
    @ApiBody({
        type: CreatePostDto,
        description: 'Create Post Fields',
    })
    @Post()
    async createPost(
        @Body() body: CreatePostDto,
        @UploadedFile(fileValidationPipe('image/jpeg')) file: Express.Multer.File,
        @CurrentUser() currentUser: UserEntity,
    ): Promise<PostEntity> {
        return this.postsService.createPost(body, currentUser, file);
    }

    @ApiOperation({ summary: 'Get All Posts' })
    @ApiOkResponse({
        type: PostEntity,
        description: 'Posts Response',
    })
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'order', enum: Order, required: false, example: 'ASC' })
    @ApiQuery({ name: 'condition', enum: OrderCondition, required: false, example: 'ID' })
    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
        @Query('order') order: Order = Order.ASC,
        @Query('condition') condition: OrderCondition = OrderCondition.ID,
    ): Promise<Pagination<PostEntity>> {
        limit = limit > 100 ? 100 : limit;
        return this.postsService.findAll({ page, limit }, order, condition);
    }

    @ApiOperation({ summary: 'Get Post By Id' })
    @ApiOkResponse({
        type: PostEntity,
        description: 'Post Response',
    })
    @ApiParam({
        name: 'id',
        description: 'Post`s Id',
    })
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<PostEntity> {
        return this.postsService.findOne(+id);
    }

    @ApiOperation({ summary: 'Update Post' })
    @ApiCreatedResponse({
        type: PostEntity,
        description: 'Successfully Updated Post',
    })
    @FilesInterceptor('file')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: UpdatePostDto,
        description: 'Update Post Fields',
    })
    @Patch(':id')
    async updatePost(
        @Param('id') id: string,
        @Body() updatePostDto: UpdatePostDto,
        @UploadedFile(fileValidationPipe('image/jpeg')) file: Express.Multer.File,
        @CurrentUser() currentUser: UserEntity,
    ): Promise<PostEntity> {
        return this.postsService.updatePost(parseInt(id), updatePostDto, currentUser, file);
    }

    @ApiOperation({ summary: 'Delete Post' })
    @ApiOkResponse({
        type: PostEntity,
        description: 'Successfully Deleted Post',
    })
    @ApiParam({
        name: 'id',
        description: 'Deleted Post`s Id',
    })
    @UserRoles(Role.Admin)
    @Delete(':id')
    async deletePost(@Param('id') id: string): Promise<PostEntity> {
        return this.postsService.deletePost(parseInt(id));
    }

    @ApiOperation({ summary: 'Publish Post' })
    @ApiOkResponse({
        type: PostEntity,
        description: 'Successfully Published Post',
    })
    @ApiParam({
        name: 'id',
        description: 'Published Post`s Id',
    })
    @Patch('publish/:id')
    async publishPost(@Param('id') id: string): Promise<PostEntity> {
        return this.postsService.publish(parseInt(id));
    }

    @ApiOperation({ summary: 'Get Post`s Image' })
    @ApiFileResponse('image/jpeg')
    @ApiParam({
        name: 'id',
        description: 'Post`s Id',
    })
    @Get(':id/image')
    async getPostImage(
        @Param('id') id: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const image = await this.postsService.getImage(parseInt(id));
        res.set({
            'Content-Type': 'image/jpeg',
            'Content-Disposition': 'attachment; filename="image.jpg"',
        });
        return new StreamableFile(image.Body);
    }

    @ApiOperation({ summary: 'Delete Post`s image' })
    @ApiOkResponse({})
    @ApiParam({
        name: 'id',
        description: 'Choose Post`s Id',
    })
    @Delete(':id/image')
    deletePostImage(@Param('id') id: string, @CurrentUser() currentUser: UserEntity) {
        return this.postsService.deleteImage(parseInt(id), currentUser);
    }
}
