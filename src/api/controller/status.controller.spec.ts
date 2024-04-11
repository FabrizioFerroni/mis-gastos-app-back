import { Test, TestingModule } from '@nestjs/testing';
import { StatusController } from './status.controller';
import { StatusService } from '../service/status.service';

describe('StatusController', () => {
  let controller: StatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [StatusService],
    }).compile();

    controller = module.get<StatusController>(StatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('It should return the status of the server', () => {
    it('should return an Avilable status', () => {
      expect(controller.getStatus()).toStrictEqual({ status: 'Disponible' });
    });
  });
});
