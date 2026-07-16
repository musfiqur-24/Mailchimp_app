export interface WorkflowActionExecution {
  origin?: { portalId?: number | string };
  object?: { objectId?: number | string };
  inputFields?: {
    recipientEmail?: string;
    subject?: string;
    mailchimpTemplate?: string;
  };
}
