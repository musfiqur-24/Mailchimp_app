# Mailchimp Workflow

HubSpot Developer Project that adds **Mailchimp → Send Mailchimp Email** to contact-based workflows.

## Phase 1

The action collects a recipient (including CRM-property mapping), subject, and mock template. The Node endpoint logs the execution payload and returns HTTP 200. No Mailchimp API call is included.

## Vercel deployment

1. Create a Vercel project from this repository.
2. Add `APP_BASE_URL` to Vercel Project Settings → Environment Variables. Its value is your production URL, such as `https://mailchimp-workflow.vercel.app`.
3. Copy `.env.example` to `.env` locally and set the same value.
4. Run `npm run sync:hubspot` before `hs project upload`. This writes the Vercel URL into HubSpot's static metadata.
5. Deploy to Vercel. HubSpot will POST executions to `https://mailchimp-app-seven.vercel.app/api/workflow-actions/send-mailchimp-email`.

The HubSpot OAuth callback URL is `https://mailchimp-app-seven.vercel.app/api/oauth/hubspot/callback`.

## Mailchimp connection

Set `KV_REST_API_URL` and `KV_REST_API_TOKEN` in Vercel. Register
`https://mailchimp-app-seven.vercel.app/api/oauth/mailchimp/callback` as the exact callback URL in the Mailchimp developer portal. After uploading the project to HubSpot, open the app's Settings tab and select **Connect Mailchimp**. The connection is stored per HubSpot portal in Redis; email sending remains intentionally disabled.
