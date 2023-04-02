import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ApiConfigModule } from '../../common/config/api-config.module';
import { ApiConfigService } from '../../common/config/api-config.service';
import { FilesService } from '../files/files.service';
import { FilesModule } from '../files/files.module';

@Module({
    imports: [TypeOrmModule.forFeature([PostEntity]), FilesModule, ApiConfigModule],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule {}
