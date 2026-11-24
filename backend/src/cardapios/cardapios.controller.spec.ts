import { Test, TestingModule } from '@nestjs/testing';
import { CardapiosController } from './cardapios.controller';

describe('CardapiosController', () => {
  let controller: CardapiosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardapiosController],
    }).compile();

    controller = module.get<CardapiosController>(CardapiosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
