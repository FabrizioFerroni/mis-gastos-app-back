export type ConfigApp = {
  env: string;
  apiPort: number;
  redis: ConfigAppRedis;
  ttl: number;
  limit: number;
  max_pass_failures: number;
  secret_jwt: string;
  secret_jwt_register: string;
  mailServiceUrl: string;
  passPrivateKey: string;
  db: DbConfig;
};

export type ConfigAppRedis = {
  host: string;
  port: number;
  username: string;
  password: string;
};

export type DbConfig = {
  type: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  bd: string;
};
