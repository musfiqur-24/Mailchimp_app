import { getRedis } from '../redis.js';
import type { MailchimpConnection, StoredPortalConnection } from '../../../types/oauth.js';
import type { WorkflowOptionsResponse } from '../../../types/workflow-options.js';

const pageSize = 100;

export class MailchimpTemplateError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

export async function getMailchimpTemplateOptions(
  portalId: string,
  query?: string,
  after?: string,
): Promise<WorkflowOptionsResponse> {
  const connection = await getMailchimpConnection(portalId);
  const offset = parseOffset(after);
  const endpoint = new URL(`https://${connection.dataCenter}.api.mailchimp.com/3.0/templates`);
  endpoint.searchParams.set('count', String(pageSize));
  endpoint.searchParams.set('offset', String(offset));

  const response = await fetch(endpoint, {
    headers: { authorization: `Bearer ${connection.accessToken}` },
  });
  const payload = (await response.json().catch(() => ({}))) as MailchimpTemplatesResponse;

  if (response.status === 401) {
    throw new MailchimpTemplateError('The connected Mailchimp account needs to be reconnected.', 401);
  }
  if (!response.ok) {
    throw new MailchimpTemplateError('Mailchimp could not load templates. Please try again.', 502);
  }

  const normalizedQuery = query?.trim().toLocaleLowerCase();
  const options = (payload.templates ?? [])
    .map((template) => ({
      label: template.name || template.title || `Template ${template.id}`,
      value: String(template.id),
    }))
    .filter((template) => !normalizedQuery || template.label.toLocaleLowerCase().includes(normalizedQuery));

  const nextOffset = offset + (payload.templates?.length ?? 0);
  return {
    options,
    ...(nextOffset < (payload.total_items ?? 0) ? { after: String(nextOffset) } : {}),
    searchable: true,
  };
}

async function getMailchimpConnection(portalId: string): Promise<MailchimpConnection> {
  const redis = getRedis();
  const portalConnection = await redis.get<StoredPortalConnection>(`portal:${portalId}`);
  if (portalConnection?.connected && portalConnection.mailchimpAccessToken && portalConnection.mailchimpServer) {
    return {
      accessToken: portalConnection.mailchimpAccessToken,
      dataCenter: portalConnection.mailchimpServer,
      connectedAt: portalConnection.connectedAt ?? new Date(0).toISOString(),
    };
  }

  const legacyConnection = await redis.get<MailchimpConnection>(`connection:mailchimp:${portalId}`);
  if (legacyConnection?.accessToken && legacyConnection.dataCenter) return legacyConnection;

  throw new MailchimpTemplateError('Connect a Mailchimp account in Mailchimp App settings first.', 404);
}

function parseOffset(after?: string): number {
  const offset = Number(after ?? 0);
  return Number.isSafeInteger(offset) && offset >= 0 ? offset : 0;
}

interface MailchimpTemplatesResponse {
  templates?: Array<{ id: number | string; name?: string; title?: string }>;
  total_items?: number;
}
