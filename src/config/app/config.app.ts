import { ConfigApp } from '@/config/types/config.app.type';

export const configApp = (): ConfigApp => {
  return {
    infisical: {
      siteUrl: process.env.INFISICAL_SITE_URL,
      clientId: process.env.INFISICAL_CLIENT_ID,
      clientSecret: process.env.INFISICAL_CLIENT_SECRET,
      environment: process.env.NODE_ENV,
      projectId: process.env.INFISICAL_PROJECTID,
      path: process.env.INFISICAL_PATH_PROJECT,
    },

    env: process.env.NODE_ENV || 'dev',
  };
};
