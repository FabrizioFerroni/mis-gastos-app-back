import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { join } from 'path';
import { Request, Response } from 'express';
import * as express from 'express';
import { CategoriasModule } from '@/api/categorias/categorias.module';
import { CuentasModule } from '@/api/cuentas/cuentas.module';
import { MovimientosModule } from '@/api/movimientos/movimientos.module';
import { UsuarioModule } from '@/api/usuario/usuario.module';

export const setupSwagger = (app: INestApplication, entorno: string) => {
  if (entorno === 'production') {
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

  if (entorno !== 'production') {
    const options: SwaggerCustomOptions = {
      customSiteTitle: 'Mis Gastos App - Backend',
    };

    const document = SwaggerModule.createDocument(app, configSwagger, {
      deepScanRoutes: true,
    });
    SwaggerModule.setup('/', app, document, options);
  } else {
    app.use('/', async (req: Request, res: Response) => {
      res
        .status(200)
        .json({ mensaje: 'Bienvenido a la api de Mis Gastos App' });
    });
  }
};
