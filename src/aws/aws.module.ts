import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { AwsController } from './aws.controller';
import { ApiConfigModule } from '../../common/config/api-config.module';

@Module({
    imports: [ApiConfigModule],
    controllers: [AwsController],
    providers: [AwsService],
})
export class AwsModule {}
