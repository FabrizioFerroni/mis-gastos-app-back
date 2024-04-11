import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { join } from 'path';

export const setupSwagger = (
  app: INestApplication,
  configService: ConfigService,
) => {
  if (configService.get<string>('NODE_ENV') === 'production') {
    const swaggerPath = join(__dirname, '..', 'node_modules/swagger-ui-dist');
    app.use('/swagger-ui', express.static(swaggerPath));
  } else {
    app.use('/swagger-ui', express.static('node_modules/swagger-ui-dist'));
  }

  const configSwagger = new DocumentBuilder()
    .setTitle('Mis Gastos App - Backend')
    .setDescription(
      'Backend hecho con NestJS para guardar los gastos mensuales',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      description:
        'Ingresar token Bearer para el inicio de sesión del proyecto',
      name: 'mis-gastos-app',
    })
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('/', app, document);
};
