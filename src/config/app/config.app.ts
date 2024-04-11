import { ConfigApp } from '@/config/types/config.app.type';

export const configApp = (): ConfigApp => {
  return {
    env: process.env.NODE_ENV || 'development',
    apiPort: Number(process.env.API_PORT) || 4000,
    limit: Number(process.env.THROTTLE_LIMIT) || 10,
    ttl: Number(process.env.THROTTLE_TTL) || 6000,
    max_pass_failures: Number(process.env.MAX_PASS_FAILURES),
    passPrivateKey: process.env.PASSWORD_PRIVATE_KEY,
    secret_jwt: process.env.SECRET_JWT || '',
    secret_jwt_register: process.env.SECRET_JWT_REGISTER || '',
    mailServiceUrl: process.env.URL_MAIL_SERVICE || '',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 16366,
      username: process.env.REDIS_USERNAME || '',
      password: process.env.REDIS_PASSWORD || '',
    },
    db: {
      type: process.env.BD_TYPE || 'mysql',
      host: process.env.BD_HOST || 'localhost',
      port: Number(process.env.BD_PORT) || 3306,
      user: process.env.BD_USER || '',
      pass: process.env.BD_PASS || '',
      bd: process.env.BD_DB || '',
    },
  };
};
