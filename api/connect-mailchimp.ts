export default {
  fetch(request: Request): Response {
    const portalId = new URL(request.url).searchParams.get('portalId');
    if (!portalId || !/^\d+$/.test(portalId)) {
      return new Response('A valid HubSpot portal ID is required.', { status: 400 });
    }

    return new Response(page(portalId), {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  },
};

function page(portalId: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Connect Mailchimp</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f8fafc; color: #172033; font-family: system-ui, sans-serif; }
      main { width: min(90vw, 460px); padding: 2.5rem; border: 1px solid #e2e8f0; border-radius: 18px; background: #fff; box-shadow: 0 20px 50px #0f172a14; }
      h1 { margin-top: 0; font-size: 1.8rem; } p { color: #475569; line-height: 1.6; }
      button { width: 100%; margin-top: 1rem; padding: 0.85rem 1rem; border: 0; border-radius: 9px; background: #2563eb; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
      button:hover { background: #1d4ed8; }
    </style>
  </head>
  <body>
    <main>
      <h1>Connect Mailchimp</h1>
      <p>You will be redirected to Mailchimp to authorize this HubSpot portal.</p>
      <form method="post" action="/api/oauth/mailchimp/start?portalId=${portalId}">
        <button type="submit">Continue to Mailchimp</button>
      </form>
    </main>
  </body>
</html>`;
}
