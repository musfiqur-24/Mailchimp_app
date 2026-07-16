import { startMailchimpAuthorization } from '../../../server/services/mailchimp/auth.js';

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(null, { status: 405, headers: { allow: 'POST' } });
    }

    const portalId = new URL(request.url).searchParams.get('portalId');
    if (!portalId || !/^\d+$/.test(portalId)) {
      return Response.json({ message: 'A valid HubSpot portal ID is required.' }, { status: 400 });
    }

    try {
      return Response.redirect(await startMailchimpAuthorization(portalId), 302);
    } catch (error) {
      console.error('Unable to start Mailchimp authorization', error);
      return Response.json({ message: 'Unable to start Mailchimp authorization.' }, { status: 500 });
    }
  },
};
