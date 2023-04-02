import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ApiConfigModule } from '../common/config/api-config.module';
import { ApiConfigService } from '../common/config/api-config.service';
import { FilesModule } from './files/files.module';
import { dataSourceOptions } from '../common/database/data-source';

@Module({
    imports: [
        UsersModule,
        PostsModule,
        AuthModule,
        FilesModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            ...dataSourceOptions,
        }),
    ],
})
export class AppModule {}