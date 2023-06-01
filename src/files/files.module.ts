import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesEntity } from './files.entity';
import { ApiConfigModule } from '../../common/config/api-config.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiConfigService } from '../../common/config/api-config.service';
import { FILE_SERVICE } from '../../common/constants/rmq-constants';

@Module({
    imports: [
        ApiConfigModule,
        TypeOrmModule.forFeature([FilesEntity]),
        ClientsModule.registerAsync([
            {
                name: FILE_SERVICE,
                imports: [ApiConfigModule],
                inject: [ApiConfigService],
                useFactory: async (config: ApiConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [config.RMQ.url],
                        queue: config.RMQ.queue,
                        queueOptions: {
                            durable: false,
                        },
                    },
                }),
            },
        ]),
    ],
    providers: [FilesService],
    exports: [FilesService],
})
export class FilesModule {}
