import { createServer } from 'node:http';
import { handleSendMailchimpEmail } from './routes/workflow-action.route.js';
import type { WorkflowActionExecution } from '../types/workflow-action.js';

const port = Number(process.env.PORT ?? 3000);
const actionPath = '/workflow-actions/send-mailchimp-email';

const server = createServer(async (request, response) => {
  if (request.method !== 'POST' || request.url !== actionPath) {
    response.writeHead(404).end();
    return;
  }

  let rawBody = '';
  for await (const chunk of request) rawBody += chunk;

  try {
    const body = JSON.parse(rawBody) as WorkflowActionExecution;
    const result = await handleSendMailchimpEmail(body);
    response.writeHead(result.statusCode, { 'content-type': 'application/json' });
    response.end(JSON.stringify({}));
  } catch (error) {
    console.error('Mailchimp workflow action request failed', error);
    response.writeHead(400, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ message: 'Invalid workflow action request.' }));
  }
});

server.listen(port, () => {
  console.info(`Mailchimp workflow action listener is running on port ${port}.`);
});
