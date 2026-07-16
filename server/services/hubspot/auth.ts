const tokenEndpoint = 'https://api.hubapi.com/oauth/2026-03/token';

export async function completeHubSpotAuthorization(code: string): Promise<void> {
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: requiredEnvironment('HUBSPOT_CLIENT_ID'),
      client_secret: requiredEnvironment('HUBSPOT_CLIENT_SECRET'),
      redirect_uri: `${requiredEnvironment('APP_BASE_URL')}/api/oauth/hubspot/callback`,
      code,
    }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      category?: string;
      correlationId?: string;
      message?: string;
    };
    throw new Error(
      `HubSpot OAuth token exchange failed with status ${response.status}: ${error.category ?? 'UNKNOWN'} (${error.correlationId ?? 'no correlation ID'}) ${error.message ?? ''}`,
    );
  }
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value.replace(/\/$/, '');
}
