import { Test, TestingModule } from '@nestjs/testing';
import { AccountSvcController } from './account-svc.controller';
import { AccountSvcService } from './account-svc.service';

describe('AccountSvcController', () => {
  let accountSvcController: AccountSvcController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AccountSvcController],
      providers: [AccountSvcService],
    }).compile();

    accountSvcController = app.get<AccountSvcController>(AccountSvcController);
  });

  // describe('root', () => {
  //   it('should return "Hello World!"', () => {
  //     expect(accountSvcController.getHello()).toBe('Hello World!');
  //   });
  // });
});
