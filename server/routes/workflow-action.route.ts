import { WorkflowActionController } from '../controllers/workflow-action.controller.js';
import type { WorkflowActionExecution } from '../../types/workflow-action.js';

const controller = new WorkflowActionController();

export async function handleSendMailchimpEmail(
  body: WorkflowActionExecution,
): Promise<{ statusCode: number }> {
  await controller.execute(body);
  return { statusCode: 200 };
}
