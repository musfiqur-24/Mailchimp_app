import type { WorkflowActionExecution } from '../../types/workflow-action.js';

export class WorkflowActionController {
  async execute(payload: WorkflowActionExecution): Promise<void> {
    const inputs = payload.inputFields ?? {};

    console.info('Mailchimp workflow action received', {
      portalId: payload.origin?.portalId,
      objectId: payload.object?.objectId,
      recipient: inputs.recipientEmail,
      subject: inputs.subject,
      template: inputs.mailchimpTemplate,
    });
  }
}
