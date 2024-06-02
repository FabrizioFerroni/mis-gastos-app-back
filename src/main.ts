import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from './shared/filters/exceptions.filter';
import { configStrings } from './config/app/config.strings';
import { setupSwagger } from './config/swagger/config.swagger.app';
import { getSecretByName } from './core/functions/infisical';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const hostCors = await getSecretByName('FRONT_HOST');
  const hostMethods = await getSecretByName('HOST_METHODS');
  const hostallowedHeaders = await getSecretByName('HOST_ALLOWED_HEADERS');
  const hostCredentials = Boolean(await getSecretByName('HOST_CREDENTIALS'));
  const entorno = await getSecretByName('API_ENV');

  const apiPort = await getSecretByName('API_PORT');

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
