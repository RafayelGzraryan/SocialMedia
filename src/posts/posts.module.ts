import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { ApiConfigModule } from '../../common/config/api-config.module';
import { FilesModule } from '../files/files.module';

@Module({
    imports: [TypeOrmModule.forFeature([PostEntity]), FilesModule, ApiConfigModule],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule {}
