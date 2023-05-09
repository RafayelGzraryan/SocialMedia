import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadURLDto } from './dto/upload-URL.dto';
import { S3 } from 'aws-sdk';
import { ApiConfigService } from '../../common/config/api-config.service';

@Injectable()
export class AwsService {
    bucketName = this.configService.AWS.bucketName;
    constructor(private readonly configService: ApiConfigService) {}

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

    async uploadUrl(uploadUrl: UploadURLDto): Promise<string> {
        const { objectKey, ContentType } = uploadUrl;
        return this.getPreSignedUrl('putObject', objectKey, { ContentType });
    }

    async downloadUrl(objectKey: string): Promise<string> {
        return this.getPreSignedUrl('getObject', objectKey);
    }

    async deleteUrl(key: string): Promise<string> {
        return this.getPreSignedUrl('deleteObject', key);
    }
}
