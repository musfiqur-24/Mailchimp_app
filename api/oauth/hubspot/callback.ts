import { completeHubSpotAuthorization } from '../../../server/services/hubspot/auth.js';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code || url.searchParams.has('error')) {
      return page('HubSpot app installation was cancelled or could not be completed.', 400);
    }

    try {
      await completeHubSpotAuthorization(code);
      return page('Mailchimp Workflow is installed. Return to HubSpot to connect Mailchimp.');
    } catch (error) {
      console.error('HubSpot OAuth token exchange failed', error);
      return page('HubSpot app installation could not be completed. Please try again.', 500);
    }
  },
};

function page(message: string, status = 200): Response {
  return new Response(`<!doctype html><title>Mailchimp Workflow</title><p>${message}</p>`, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
