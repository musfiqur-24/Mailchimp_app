import { getRedis } from '../redis.js';
import type { MailchimpConnection, OAuthState } from '../../../types/oauth.js';

const callbackPath = '/api/oauth/mailchimp/callback';

export async function startMailchimpAuthorization(portalId: string): Promise<string> {
  const state = crypto.randomUUID();
  await getRedis().set(`oauth:mailchimp:state:${state}`, { portalId } satisfies OAuthState, {
    ex: 600,
  });

  const authorizationUrl = new URL('https://login.mailchimp.com/oauth2/authorize');
  authorizationUrl.search = new URLSearchParams({
    response_type: 'code',
    client_id: requiredEnvironment('MAILCHIMP_CLIENT_ID'),
    redirect_uri: `${requiredEnvironment('APP_BASE_URL')}${callbackPath}`,
    state,
  }).toString();
  return authorizationUrl.toString();
}

export async function completeMailchimpAuthorization(code: string, state: string): Promise<void> {
  const redis = getRedis();
  const savedState = await redis.get<OAuthState>(`oauth:mailchimp:state:${state}`);
  await redis.del(`oauth:mailchimp:state:${state}`);
  if (!savedState) throw new Error('The Mailchimp connection request expired.');

  const tokenResponse = await fetch('https://login.mailchimp.com/oauth2/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: requiredEnvironment('MAILCHIMP_CLIENT_ID'),
      client_secret: requiredEnvironment('MAILCHIMP_CLIENT_SECRET'),
      redirect_uri: `${requiredEnvironment('APP_BASE_URL')}${callbackPath}`,
      code,
    }),
  });
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenResponse.ok || !token.access_token) throw new Error('Mailchimp rejected the authorization code.');

  const metadataResponse = await fetch('https://login.mailchimp.com/oauth2/metadata', {
    headers: { authorization: `OAuth ${token.access_token}` },
  });
  const metadata = (await metadataResponse.json()) as { dc?: string };
  if (!metadataResponse.ok || !metadata.dc) throw new Error('Mailchimp did not return an account data center.');

  const connection: MailchimpConnection = {
    accessToken: token.access_token,
    dataCenter: metadata.dc,
    connectedAt: new Date().toISOString(),
  };
  await redis.set(`connection:mailchimp:${savedState.portalId}`, connection);
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value.replace(/\/$/, '');
}
