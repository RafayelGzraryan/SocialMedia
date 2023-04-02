import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Repository } from 'typeorm';
import { FilesEntity } from './files.entity';
import { ApiConfigService } from '../../common/config/api-config.service';
import { v4 as uuid } from 'uuid';
import { FileDto } from './dto/file.dto';
import { createReadStream } from 'fs';

@Injectable()
export class FilesService {
    bucketName = this.configService.AWS.bucketName;
    constructor(
        @InjectRepository(FilesEntity)
        private filesRepo: Repository<FilesEntity>,
        private readonly configService: ApiConfigService,
    ) {}

    async createFile(createFileDto: FileDto, postId: number): Promise<FilesEntity> {
        const newFile = await this.filesRepo.create({
            key: createFileDto.key,
            url: createFileDto.url,
            post: { id: postId },
        });
        return this.filesRepo.save(newFile);
    }

    async uploadFile(dataBuffer: Buffer, filename: string): Promise<FileDto> {
        try {
            const s3 = new S3();
            const uploadResult = await s3
                .upload({
                    Bucket: this.bucketName,
                    Body: dataBuffer,
                    Key: `${uuid()}-${filename}`,
                })
                .promise();
            return { key: uploadResult.Key, url: uploadResult.Location };
        } catch (err) {
            if (err) {
                throw new NotFoundException('Image object not found');
            }
        }
    }

    async deleteFile(key: string): Promise<FilesEntity> {
        try {
            const s3 = new S3();
            await s3
                .deleteObject({
                    Bucket: this.bucketName,
                    Key: key,
                })
                .promise();
            const file = await this.filesRepo.findOneByOrFail({ key });
            return this.filesRepo.remove(file);
        } catch (err) {
            if (err) {
                throw new NotFoundException('File or Image object not  found');
            }
        }
    }

    async downloadFile(key: string): Promise<any> {
        try {
            const s3 = new S3();
            return s3
                .getObject({
                    Bucket: this.bucketName,
                    Key: key,
                })
                .promise();
        } catch (err) {
            if (err) {
                throw new NotFoundException('Image object not found');
            }
        }
    }
}
