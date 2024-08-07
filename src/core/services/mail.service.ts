import { configApp } from '@/config/app/config.app';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MailService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(MailService.name, { timestamp: true });

  async sendMail(queue: string, body: object) {
    if (!configApp().mailServiceUrl) {
      this.logger.error('Mail service url not set');
      throw new InternalServerErrorException('Internal Server Error');
    }

    const response = await firstValueFrom(
      this.httpService.post(
        `${configApp().mailServiceUrl}/email/${configApp().exchange}/${queue}`,
        body,
      ),
    );

    return response.data;
  }
}
