import { configApp } from '@/config/app/config.app';
import { InfisicalClient, LogLevel } from '@infisical/sdk';

const client = new InfisicalClient({
  siteUrl: configApp().infisical.siteUrl,
  auth: {
    universalAuth: {
      clientId: configApp().infisical.clientId,
      clientSecret: configApp().infisical.clientSecret,
    },
  },
  logLevel: LogLevel.Info,
});

export async function getSecretByName(secretName: string) {
  try {
    return (
      await client.getSecret({
        environment: configApp().infisical.environment,
        projectId: configApp().infisical.projectId,
        secretName,
        path: configApp().infisical.path,
      })
    ).secretValue;
  } catch (error) {
    console.error(error);
  }
}
