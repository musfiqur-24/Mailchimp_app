import { readFile, writeFile } from 'node:fs/promises';

const baseUrl = process.env.APP_BASE_URL?.replace(/\/$/, '');

if (!baseUrl || !URL.canParse(baseUrl) || new URL(baseUrl).protocol !== 'https:') {
  throw new Error('APP_BASE_URL must be a valid public HTTPS URL.');
}

const appMetadataPath = 'src/app/app-hsmeta.json';
const workflowMetadataPath = 'src/app/workflow-actions/send-mailchimp-email-hsmeta.json';

let appMetadata = await readFile(appMetadataPath, 'utf8');
appMetadata = appMetadata.replace(
  /https:\/\/[^"/]+(?:\/[^"/]*)*\/api\/oauth(?:\/hubspot)?\/callback/g,
  `${baseUrl}/api/oauth/hubspot/callback`,
);
await writeFile(appMetadataPath, appMetadata);

let workflowMetadata = await readFile(workflowMetadataPath, 'utf8');
workflowMetadata = workflowMetadata.replace(
  /https:\/\/[^"/]+(?:\/[^"/]*)*\/api\/workflow-actions\/send-mailchimp-email/g,
  `${baseUrl}/api/workflow-actions/send-mailchimp-email`,
);
await writeFile(workflowMetadataPath, workflowMetadata);

console.info(`HubSpot action URLs now use ${baseUrl}.`);
