import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HealthStatus } from '@/types/health.type';
import { AppModule } from '@/app.module';

describe('StatusController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/estado (GET)', () => {
    const mockResponse = {
      message: 'Solicitud éxitosa',
      data: {
        status: HealthStatus.AVAILABLE,
      },
      status_code: 200,
    };

    return request(app.getHttpServer())
      .get('/estado')
      .expect(200)
      .expect(mockResponse);
  });
});
