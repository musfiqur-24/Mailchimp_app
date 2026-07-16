import { HubSpotConnectionError } from '../../server/services/hubspot/auth.js';
import { getHubSpotUserOptions } from '../../server/services/hubspot/users.js';
import type { WorkflowOptionsRequest } from '../../types/workflow-options.js';

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(null, { status: 405, headers: { allow: 'POST' } });
    }

    try {
      const payload = (await request.json()) as WorkflowOptionsRequest;
      const portalId = payload.origin?.portalId;
      if (!portalId) return error('HubSpot did not provide a portal ID.', 400);

      return Response.json(
        await getHubSpotUserOptions(String(portalId), payload.fetchOptions?.q, payload.fetchOptions?.after),
      );
    } catch (exception) {
      if (exception instanceof HubSpotConnectionError) {
        return error(exception.message, exception.statusCode);
      }
      console.error('Unable to load HubSpot users', exception);
      return error('Unable to load HubSpot users.', 500);
    }
  },
};

function error(message: string, status: number): Response {
  return Response.json({ message }, { status });
}
