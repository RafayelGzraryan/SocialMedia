import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { dataSourceOptions } from '../common/database/data-source';
import { AwsModule } from './aws/aws.module';

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
        AwsModule,
    ],
})
export class AppModule {}
