import { getRedis } from '../redis.js';
import type { StoredPortalConnection } from '../../../types/oauth.js';

const tokenEndpoint = 'https://api.hubapi.com/oauth/2026-03/token';

export async function completeHubSpotAuthorization(code: string): Promise<string> {
  const token = await requestHubSpotToken({
    grant_type: 'authorization_code',
    code,
  });
  if (!token.hub_id) throw new Error('HubSpot did not return a portal ID.');

  await saveHubSpotToken(String(token.hub_id), token);
  return String(token.hub_id);
}

export async function getHubSpotAccessToken(portalId: string): Promise<string> {
  const connection = await getRedis().get<StoredPortalConnection>(`portal:${portalId}`);
  if (!connection?.hubspotAccessToken || !connection.hubspotRefreshToken) {
    throw new HubSpotConnectionError('Reconnect Mailchimp App in HubSpot to load users.', 404);
  }

  if (connection.hubspotAccessTokenExpiresAt && Date.parse(connection.hubspotAccessTokenExpiresAt) > Date.now() + 60_000) {
    return connection.hubspotAccessToken;
  }

  const token = await requestHubSpotToken({
    grant_type: 'refresh_token',
    refresh_token: connection.hubspotRefreshToken,
  });
  await saveHubSpotToken(portalId, token);
  return token.access_token;
}

export class HubSpotConnectionError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
  }
}

async function requestHubSpotToken(input: { grant_type: 'authorization_code'; code: string } | { grant_type: 'refresh_token'; refresh_token: string }): Promise<HubSpotTokenResponse> {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: input.grant_type,
      client_id: requiredEnvironment('HUBSPOT_CLIENT_ID'),
      client_secret: requiredEnvironment('HUBSPOT_CLIENT_SECRET'),
      redirect_uri: `${requiredEnvironment('APP_BASE_URL')}/api/oauth/hubspot/callback`,
      ...(input.grant_type === 'authorization_code' ? { code: input.code } : { refresh_token: input.refresh_token }),
    }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      category?: string;
      correlationId?: string;
      message?: string;
    };
    throw new HubSpotConnectionError(
      `HubSpot OAuth token exchange failed with status ${response.status}: ${error.category ?? 'UNKNOWN'} (${error.correlationId ?? 'no correlation ID'}) ${error.message ?? ''}`,
      response.status,
    );
  }

  return (await response.json()) as HubSpotTokenResponse;
}

async function saveHubSpotToken(portalId: string, token: HubSpotTokenResponse): Promise<void> {
  const redis = getRedis();
  const existing = await redis.get<StoredPortalConnection>(`portal:${portalId}`);
  await redis.set(`portal:${portalId}`, {
    ...existing,
    hubspotAccessToken: token.access_token,
    hubspotRefreshToken: token.refresh_token,
    hubspotAccessTokenExpiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
  } satisfies StoredPortalConnection);
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value.replace(/\/$/, '');
}

interface HubSpotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  hub_id?: number | string;
}
