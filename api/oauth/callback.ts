/**
 * OAuth token exchange and storage are intentionally deferred beyond Phase 1.
 * This endpoint exists so the configured redirect URL resolves after Vercel deployment.
 */
export default {
  fetch(): Response {
    return Response.json(
      { message: 'Mailchimp Workflow OAuth setup is not implemented in Phase 1.' },
      { status: 501 },
    );
  },
};
