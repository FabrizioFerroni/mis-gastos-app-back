import { ConfigApp } from '@/config/types/config.app.type';

export const configApp = (): ConfigApp => {
  return {
    env: process.env.NODE_ENV || 'development',
    apiPort: Number(process.env.API_PORT) || 8080,
    limit: Number(process.env.THROTTLE_LIMIT) || 10,
    ttl: Number(process.env.THROTTLE_TTL) || 6000,
    max_pass_failures: Number(process.env.MAX_PASS_FAILURES),
    passPrivateKey: process.env.PASSWORD_PRIVATE_KEY,
    pathPrivateKey: process.env.PATH_PRIVATE_KEY,
    exchange: process.env.APP_EXCHANGE || 'mis-gastos-app',
    appHost: process.env.APP_FRONT_HOST || 'http://localhost:4200',
    appMail: process.env.APP_MAIL || 'http://localhost:4200',
    appImg: process.env.APP_IMG || 'http://localhost:4200',
    tz: process.env.TZ || 'Europe/Madrid',
    secret_jwt: process.env.SECRET_JWT || '',
    secret_jwt_refresh: process.env.SECRET_JWT_REFRESH || '',
    secret_jwt_register: process.env.SECRET_JWT_REGISTER || '',
    mailServiceUrl: process.env.URL_MAIL_SERVICE || '',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      username: process.env.REDIS_USERNAME || '',
      password: process.env.REDIS_PASSWORD || '',
      ttl: Number(process.env.REDIS_TTL) || 30000,
    },
    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 3306,
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_BASEDATOS || '',
    },
    frontHost: process.env.FRONT_HOST,
    hostMethod: process.env.HOST_METHODS,
    hostAllowedHeader: process.env.HOST_ALLOWED_HEADERS,
    hostCredentials: Boolean(process.env.HOST_CREDENTIALS),
  };
};
