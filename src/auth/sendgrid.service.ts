import { Injectable } from '@nestjs/common';
import { ApiConfigService } from '../../common/config/api-config.service';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendgridService {
    constructor(private readonly config: ApiConfigService) {
        SendGrid.setApiKey(config.sendgrid.key);
    }

    async send(mail: SendGrid.MailDataRequired) {
        const transport = await SendGrid.send(mail);
        console.log(`E-Mail sent to ${mail.to}`);
        return transport;
    }
}
