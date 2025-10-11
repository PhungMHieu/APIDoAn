import { Test, TestingModule } from '@nestjs/testing';
import { TransactionSvcController } from './transaction-svc.controller';
import { TransactionSvcService } from './transaction-svc.service';

describe('TransactionSvcController', () => {
  let transactionSvcController: TransactionSvcController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TransactionSvcController],
      providers: [TransactionSvcService],
    }).compile();

    transactionSvcController = app.get<TransactionSvcController>(TransactionSvcController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(transactionSvcController.getHello()).toBe('Hello World!');
    });
  });
});
