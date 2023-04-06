import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Repository } from 'typeorm';
import { FilesEntity } from './files.entity';
import { ApiConfigService } from '../../common/config/api-config.service';
import { v4 as uuid } from 'uuid';
import { FileDto } from './dto/file.dto';
import axios from 'axios';

@Injectable()
export class FilesService {
    bucketName = this.configService.AWS.bucketName;
    constructor(
        @InjectRepository(FilesEntity)
        private filesRepo: Repository<FilesEntity>,
        private readonly configService: ApiConfigService,
    ) {}

    async createFile(createFileDto: FileDto, postId: number): Promise<FilesEntity> {
        try {
            const newFile = await this.filesRepo.create({
                key: createFileDto.objectKey,
                url: createFileDto.preSignedUrl,
                post: { id: postId },
            });
            return this.filesRepo.save(newFile);
        } catch (err) {
            if (err) {
                throw new BadRequestException('Filed to create file in file repository');
            }
        }
    }

    async getPreSignedUrl(
        action: string,
        objectKey: string,
        contentType?: object,
    ): Promise<string> {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: objectKey,
                Expires: this.configService.AWS.expires,
                ...contentType,
            };
            const s3 = new S3({
                accessKeyId: this.configService.AWS.accessKeyId,
                secretAccessKey: this.configService.AWS.secretAccessKey,
                region: this.configService.AWS.region,
                signatureVersion: this.configService.AWS.signatureVersion,
            });
            return s3.getSignedUrlPromise(action, params);
        } catch (err) {
            if (err) {
                throw new BadRequestException('Failed to get presigned url');
            }
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<FileDto> {
        const objectKey = `${uuid()}-${file.originalname}`;
        const preSignedUrl = await this.getPreSignedUrl('putObject', objectKey, {
            ContentType: file.mimetype,
        });
        try {
            await axios.put(preSignedUrl, file.buffer);
            return {
                objectKey: objectKey,
                preSignedUrl: preSignedUrl,
            };
        } catch (err) {
            if (err) {
                throw new BadRequestException('Failed to send image to AWS S3 bucket');
            }
        }
    }
    async downloadFile(objectKey: string): Promise<Buffer> {
        const preSignedUrl = await this.getPreSignedUrl('getObject', objectKey);
        try {
            const axiosResponse = await axios.get(preSignedUrl, {
                responseType: 'arraybuffer',
            });
            return Buffer.from(axiosResponse.data, 'binary');
        } catch (err) {
            if (err) {
                throw new BadRequestException('Filed to download image from S3 bucket');
            }
        }
    }

    async deleteFile(key: string): Promise<FilesEntity> {
        const preSignedUrl = await this.getPreSignedUrl('deleteObject', key);
        try {
            await axios.delete(preSignedUrl);
            const file = await this.filesRepo.findOneByOrFail({ key });
            return this.filesRepo.remove(file);
        } catch (err) {
            if (err) {
                throw new NotFoundException('Image not  found');
            }
        }
    }
}
