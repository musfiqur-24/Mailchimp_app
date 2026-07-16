/**
 * HubSpot has already completed app installation before this redirect occurs.
 * This app does not yet call HubSpot APIs, so token exchange is deferred until
 * a HubSpot API feature requires it.
 */
export default {
  fetch(request: Request): Response {
    const error = new URL(request.url).searchParams.get('error');
    const message = error
      ? 'HubSpot app installation was cancelled or could not be completed.'
      : 'Mailchimp Workflow is installed. Return to HubSpot to connect Mailchimp.';
    return new Response(`<!doctype html><title>Mailchimp Workflow</title><p>${message}</p>`, {
      status: error ? 400 : 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  },
};
