import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesEntity } from './files.entity';
import { ApiConfigModule } from '../../common/config/api-config.module';

@Module({
    imports: [ApiConfigModule, TypeOrmModule.forFeature([FilesEntity])],
    providers: [FilesService],
    exports: [FilesService],
})
export class FilesModule {}
