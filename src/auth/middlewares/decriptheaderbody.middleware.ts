import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { DecryptCredentialsService } from '../services/decrypt-credentials.service';

@Injectable()
export class DecriptHeaderBodyMiddleware implements NestMiddleware {
  constructor(
    private readonly decryptCredentialService: DecryptCredentialsService,
  ) {}

  use(req: Request, res: Response, next: () => void) {
    const headersBasic = req.headers['basic'];

    const credentialsClean = this.decryptCredentialService.main(
      headersBasic as string,
    );

    req.body = credentialsClean;

    next();
  }
}
