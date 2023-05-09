import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AwsService } from './aws.service';
import { UploadURLDto } from './dto/upload-URL.dto';

@Controller()
export class AwsController {
    constructor(private readonly awsService: AwsService) {}

    @MessagePattern({ cmd: 'get_uploadUrl' })
    async uploadUrl(@Payload() uploadAwDto: UploadURLDto): Promise<string> {
        return this.awsService.uploadUrl(uploadAwDto);
    }

    @MessagePattern({ cmd: 'get_downloadUrl' })
    async downloadUrl(@Payload() objectKey: string): Promise<string> {
        return this.awsService.downloadUrl(objectKey);
    }

    @MessagePattern({ cmd: 'get_deleteUrl' })
    async deleteUrl(@Payload() objectKey: string): Promise<string> {
        return this.awsService.deleteUrl(objectKey);
    }
}
