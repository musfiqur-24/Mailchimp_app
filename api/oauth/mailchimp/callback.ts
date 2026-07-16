import { completeMailchimpAuthorization } from '../../../server/services/mailchimp/auth.js';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || !state || url.searchParams.has('error')) return page('Mailchimp connection was cancelled.', 400);

    try {
      await completeMailchimpAuthorization(code, state);
      return page('Mailchimp is connected. You can close this window and return to HubSpot.');
    } catch (error) {
      console.error('Unable to complete Mailchimp authorization', error);
      return page('Mailchimp connection failed. Return to HubSpot and try again.', 500);
    }
  },
};

function page(message: string, status = 200): Response {
  return new Response(`<!doctype html><title>Mailchimp Workflow</title><p>${message}</p>`, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
