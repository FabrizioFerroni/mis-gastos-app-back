import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from './shared/filters/exceptions.filter';
import { configStrings } from './config/app/config.strings';
import { setupSwagger } from './config/swagger/config.swagger.app';
import { configApp } from './config/app/config.app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const hostCors = configApp().frontHost;
  const hostMethods = configApp().hostMethod;
  const hostallowedHeaders = configApp().hostAllowedHeader;
  const hostCredentials = configApp().hostCredentials;
  const entorno = configApp().env;
  const apiPort = configApp().apiPort;

  app.enableCors({
    origin: hostCors,
    credentials: hostCredentials,
    methods: hostMethods,
    allowedHeaders: hostallowedHeaders,
  });

  app.useGlobalFilters(new CustomExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
      },
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.setGlobalPrefix(configStrings().apiVersion, { exclude: ['estado'] });
  setupSwagger(app, entorno);

  await app.listen(apiPort);
}
bootstrap();
