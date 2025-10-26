import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccountSvcService } from './account-svc.service';
import { JwtAuthGuard, CurrentUser, Roles, RolesGuard } from '@app/shared/auth';
import type { CurrentUserData } from '@app/shared';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AccountSvcController {
  constructor(private readonly accountSvcService: AccountSvcService) {}

  @ApiOperation({ summary: 'Get account service info' })
  @Get()
  getHello(@CurrentUser() user: CurrentUserData): string {
    console.log('Authenticated user in account-svc:', user);
    return this.accountSvcService.getHello();
  }
}
