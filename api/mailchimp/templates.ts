import { getMailchimpTemplateOptions, MailchimpTemplateError } from '../../server/services/mailchimp/templates.js';
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

      const options = await getMailchimpTemplateOptions(
        String(portalId),
        payload.fetchOptions?.q,
        payload.fetchOptions?.after,
      );
      return Response.json(options);
    } catch (exception) {
      if (exception instanceof MailchimpTemplateError) {
        return error(exception.message, exception.statusCode);
      }
      console.error('Unable to load Mailchimp templates', exception);
      return error('Unable to load Mailchimp templates.', 500);
    }
  },
};

function error(message: string, status: number): Response {
  return Response.json({ message }, { status });
}
