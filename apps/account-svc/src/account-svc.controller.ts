import { Controller, Get } from '@nestjs/common';
import { AccountSvcService } from './account-svc.service';

@Controller()
export class AccountSvcController {
  constructor(private readonly accountSvcService: AccountSvcService) {}

  @Get()
  getHello(): string {
    return this.accountSvcService.getHello();
  }
}
