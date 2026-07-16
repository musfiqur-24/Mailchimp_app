import { handleSendMailchimpEmail } from '../../server/routes/workflow-action.route.js';
import type { WorkflowActionExecution } from '../../types/workflow-action.js';

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(null, { status: 405, headers: { allow: 'POST' } });
    }

    try {
      const payload = (await request.json()) as WorkflowActionExecution;
      const result = await handleSendMailchimpEmail(payload);
      return Response.json({}, { status: result.statusCode });
    } catch (error) {
      console.error('Mailchimp workflow action request failed', error);
      return Response.json(
        { message: 'Invalid workflow action request.' },
        { status: 400 },
      );
    }
  },
};
