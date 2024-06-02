export type ConfigApp = {
  infisical: InfisicalConfig;
  env: string;
};

export type InfisicalConfig = {
  siteUrl: string;
  clientId: string;
  clientSecret: string;
  projectId: string;
  environment: string;
  path: string;
};
