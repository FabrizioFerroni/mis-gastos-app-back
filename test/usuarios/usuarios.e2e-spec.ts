import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import generate from '../generateUsernames';

describe('UsuarioController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/usuarios (POST)', async () => {
    const nombre = generate();
    const apellido = generate();
    const newUser = {
      nombre: `${nombre}`,
      apellido: `${apellido}`,
      email: `${nombre.toLowerCase()}_${apellido.toLowerCase()}@test.com`,
      password: 'MiFakePassword1234#',
      confirm_password: 'MiFakePassword1234#',
    };

    return await request(app.getHttpServer())
      .post('/usuarios')
      .send(newUser)
      .expect(201);
  });

  it('/api/usuarios (GET)', () => {
    return request(app.getHttpServer()).get('/usuarios').expect(200);
  });

  it('/api/usuarios?page=1&limit=10 (GET)', () => {
    const query = '?page=1&limit=10';
    return request(app.getHttpServer()).get(`/usuarios${query}`).expect(200);
  });

  it('/api/usuarios/{id} (404, GET)', async () => {
    const id = 'id';
    const mockResponse = {
      messageException: 'Usuario no encontrado',
      message: {
        message: 'Usuario no encontrado',
        error: 'Not Found',
        statusCode: 404,
      },
      path: `/usuarios/${id}`,
      status_code: 404,
      timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
    };

    const response = await request(app.getHttpServer())
      .get(`/usuarios/${id}`)
      .expect(404);

    expect(response.body).toEqual({
      ...mockResponse,
      timestamp: expect.any(String),
    });
  });

  it('/api/usuarios/{id} (200, GET)', () => {
    const id = '169cedd7-323f-4104-8094-7970f522f0f3';
    return request(app.getHttpServer()).get(`/usuarios/${id}`).expect(200);
  });

  it('/api/usuarios/{id} (200, PUT)', async () => {
    const nombre = generate();
    const apellido = generate();
    const editUser = {
      nombre: `${nombre}`,
      apellido: `${apellido}`,
      email: `${nombre.toLowerCase()}_${apellido.toLowerCase()}@test.com`,
      active: true,
    };

    return await request(app.getHttpServer())
      .put('/usuarios/028e057d-4c4f-4d3d-a11b-563c79ccd6dd')
      .send(editUser)
      .expect(200);
  });

  it('/api/usuarios/{id} (400, DELETE)', () => {
    const id = '84357329-eacd-489a-ac9e-7357df8d26ba';
    return request(app.getHttpServer()).delete(`/usuarios/${id}`).expect(200);
  });
});
