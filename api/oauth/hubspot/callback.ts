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
      return page({
        eyebrow: 'Installation complete',
        title: 'Your HubSpot app is connected.',
        message: 'Mailchimp App is ready in HubSpot. Return to the app settings to connect your Mailchimp account.',
        tone: 'success',
      });
    } catch (error) {
      console.error('HubSpot OAuth token exchange failed', error);
      return page(
        {
          eyebrow: 'Connection issue',
          title: 'We could not finish the HubSpot connection.',
          message: 'Return to HubSpot and try again. If the problem continues, contact your app administrator.',
          tone: 'error',
        },
        500,
      );
    }
  },
};

function page(
  content: { eyebrow: string; title: string; message: string; tone: 'success' | 'error' },
  status = 200,
): Response {
  const accent = content.tone === 'success' ? '#22c55e' : '#ef4444';
  const icon = content.tone === 'success' ? '✓' : '!';

  return new Response(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mailchimp App</title>
    <style>
      :root { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #f7f8fc; }
      * { box-sizing: border-box; }
      body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 1.5rem; background: radial-gradient(circle at 12% 8%, #e8ddff 0, transparent 28rem), radial-gradient(circle at 90% 90%, #d9f6fb 0, transparent 26rem), #f7f8fc; }
      main { width: min(100%, 560px); padding: 3rem; border: 1px solid #e6e8f0; border-radius: 24px; background: rgba(255,255,255,.94); box-shadow: 0 25px 70px rgba(39, 32, 71, .13); text-align: center; }
      .icon { width: 62px; height: 62px; display: grid; place-items: center; margin: 0 auto 1.5rem; border-radius: 50%; background: ${accent}; color: #fff; font-size: 2rem; font-weight: 800; box-shadow: 0 0 0 8px color-mix(in srgb, ${accent} 13%, transparent); }
      .eyebrow { margin: 0; color: ${accent}; font-size: .78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      h1 { margin: .65rem 0 1rem; font-size: clamp(1.8rem, 5vw, 2.45rem); line-height: 1.12; letter-spacing: -.045em; }
      p { max-width: 42ch; margin: 0 auto; color: #5d6475; font-size: 1rem; line-height: 1.65; }
      .note { display: flex; gap: .6rem; align-items: center; margin-top: 2rem; padding: .9rem 1rem; border-radius: 12px; background: #f4f5f9; color: #697185; font-size: .88rem; text-align: left; }
      .dot { width: .5rem; height: .5rem; flex: 0 0 auto; border-radius: 50%; background: ${accent}; }
      @media (max-width: 480px) { main { padding: 2.25rem 1.5rem; } }
    </style>
  </head>
  <body>
    <main>
      <div class="icon" aria-hidden="true">${icon}</div>
      <p class="eyebrow">${content.eyebrow}</p>
      <h1>${content.title}</h1>
      <p>${content.message}</p>
      <div class="note"><span class="dot" aria-hidden="true"></span><span>You can safely close this window when you are done.</span></div>
    </main>
  </body>
</html>`, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
