import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountSvcService {
  getHello(): string {
    return 'Hello World!';
  }
}
