import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { FilesEntity } from './files.entity';
import { ApiConfigService } from '../../common/config/api-config.service';
import { FILE_SERVICE } from '../../common/constants/rmq-constants';
import { FileDto } from './dto/file.dto';
import { firstValueFrom } from 'rxjs';
import {
    ImageNotFoundException,
    FailedToCreateFileException,
    FailedToUploadImageException,
    FailedToDownloadImageException,
    FailedToDeleteImageException
} from "../../common/exceptions";

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(FilesEntity)
        private filesRepo: Repository<FilesEntity>,
        private readonly configService: ApiConfigService,
        @Inject(FILE_SERVICE) private readonly fileClient: ClientProxy,
    ) {}

    async createFile(createFileDto: FileDto, postId: number): Promise<FilesEntity> {
        try {
            const newFile = await this.filesRepo.create({
                key: createFileDto.key,
                url: createFileDto.url,
                post: { id: postId },
            });
            return this.filesRepo.save(newFile);
        } catch (err) {
            if (err) {
                throw new FailedToCreateFileException('Filed to create file in file repository');
            }
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<FileDto> {
        const objectKey = `${uuid()}-${file.originalname}`;
        try {
            const preSignedUrl = await firstValueFrom(
                this.fileClient.send(
                    { cmd: 'get_uploadUrl' },
                    { objectKey, ContentType: file.mimetype },
                ),
            );
            await axios.put(preSignedUrl, file.buffer);
            return {
                key: objectKey,
                url: preSignedUrl,
            };
        } catch (err) {
            if (err) {
                throw new FailedToUploadImageException('Failed to upload image');
            }
        }
    }

    async downloadFile(objectKey: string): Promise<Buffer> {
        try {
            const preSignedUrl = await firstValueFrom(
                this.fileClient.send({ cmd: 'get_downloadUrl' }, objectKey),
            );
            const axiosResponse = await axios.get(preSignedUrl, {
                responseType: 'arraybuffer',
            });
            return Buffer.from(axiosResponse.data, 'binary');
        } catch (err) {
            if (err) {
                throw new FailedToDownloadImageException(`Filed to download image`);
            }
        }
    }

    async deleteFile(key: string): Promise<FilesEntity> {
        const file = await this.filesRepo.findOne({ where: { key } });
        if (!file) {
            throw new ImageNotFoundException('Image not found');
        }
        try {
            const preSignedUrl = await firstValueFrom(
                this.fileClient.send({ cmd: 'get_deleteUrl' }, key),
            );
            await axios.delete(preSignedUrl);
            return this.filesRepo.remove(file);
        } catch (err) {
            if (err) {
                throw new FailedToDeleteImageException('Filed to delete image');
            }
        }
    }
}
