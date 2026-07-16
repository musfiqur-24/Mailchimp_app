import { getHubSpotAccessToken, HubSpotConnectionError } from './auth.js';
import type { WorkflowOptionsResponse } from '../../../types/workflow-options.js';

const endpoint = 'https://api.hubapi.com/settings/users/2026-03';

export async function getHubSpotUserOptions(
  portalId: string,
  query?: string,
  after?: string,
): Promise<WorkflowOptionsResponse> {
  const accessToken = await getHubSpotAccessToken(portalId);
  const url = new URL(endpoint);
  url.searchParams.set('limit', '100');
  if (after) url.searchParams.set('after', after);

  const response = await fetch(url, { headers: { authorization: `Bearer ${accessToken}` } });
  const payload = (await response.json().catch(() => ({}))) as HubSpotUsersResponse;
  if (response.status === 401) {
    throw new HubSpotConnectionError('Reconnect Mailchimp App in HubSpot to load users.', 401);
  }
  if (!response.ok) {
    throw new HubSpotConnectionError('HubSpot could not load users. Please try again.', 502);
  }

  const normalizedQuery = query?.trim().toLocaleLowerCase();
  const options = (payload.results ?? [])
    .filter((user) => Boolean(user.email))
    .map((user) => {
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
      const label = name ? `${name} <${user.email}>` : user.email;
      return { label, value: user.email };
    })
    .filter((user) => !normalizedQuery || user.label.toLocaleLowerCase().includes(normalizedQuery));

  return {
    options,
    ...(payload.paging?.next?.after ? { after: payload.paging.next.after } : {}),
    searchable: true,
  };
}

interface HubSpotUsersResponse {
  results?: Array<{ email: string; firstName?: string; lastName?: string }>;
  paging?: { next?: { after?: string } };
}
