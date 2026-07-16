const tokenEndpoint = 'https://api.hubapi.com/oauth/v3/token';

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
    throw new Error(`HubSpot OAuth token exchange failed with status ${response.status}.`);
  }
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value.replace(/\/$/, '');
}
