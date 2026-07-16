# Mailchimp Workflow

HubSpot Developer Project that adds **Mailchimp → Send Mailchimp Email** to contact-based workflows.

## Phase 1

The action collects a recipient (including CRM-property mapping), subject, and mock template. The Node endpoint logs the execution payload and returns HTTP 200. No Mailchimp API call is included.

## Vercel deployment

1. Create a Vercel project from this repository.
2. Add `APP_BASE_URL` to Vercel Project Settings → Environment Variables. Its value is your production URL, such as `https://mailchimp-workflow.vercel.app`.
3. Copy `.env.example` to `.env` locally and set the same value.
4. Run `npm run sync:hubspot` before `hs project upload`. This writes the Vercel URL into HubSpot's static metadata.
5. Deploy to Vercel. HubSpot will POST executions to `https://<your-domain>/api/workflow-actions/send-mailchimp-email`.

The OAuth callback URL is `https://<your-domain>/api/oauth/callback`. The callback endpoint is deliberately a Phase 1 placeholder; token exchange and persistence will be implemented with Mailchimp authentication in a later phase.
