import React from 'react';
import { Button, Flex, Text, hubspot } from '@hubspot/ui-extensions';

interface ExtensionContext {
  portal: { id: number | string };
}

hubspot.extend(({ context }) => <MailchimpSettings context={context as ExtensionContext} />);

function MailchimpSettings({ context }: { context: ExtensionContext }) {
  const portalId = encodeURIComponent(String(context.portal.id));
  const connectUrl = `https://mailchimp-app-seven.vercel.app/api/oauth/mailchimp/start?portalId=${portalId}`;

  return (
    <Flex direction="column" gap="small">
      <Text>Connect a Mailchimp account to enable Mailchimp Workflow.</Text>
      <Button href={{ url: connectUrl, external: true }} variant="primary">
        Connect Mailchimp
      </Button>
      <Text format={{ fontSize: 'sm' }}>Email sending is not enabled in this phase.</Text>
    </Flex>
  );
}
