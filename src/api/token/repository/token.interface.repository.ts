import { Injectable } from '@nestjs/common';
import { TokenEntity } from '../entity/token.entity';
import { UpdateResult } from 'typeorm';

@Injectable()
export abstract class TokenInterfaceRepository {
  abstract saveToken(token: TokenEntity): Promise<TokenEntity>;
  abstract findByTokenId(tokenId: string): Promise<TokenEntity>;
  abstract updateToken(id: string, token: TokenEntity): Promise<UpdateResult>;
  abstract findById(id: string): Promise<TokenEntity>;
}
