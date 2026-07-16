export interface WorkflowOptionsRequest {
  origin?: { portalId?: number | string };
  fetchOptions?: { q?: string; after?: string };
}

export interface WorkflowOption {
  label: string;
  value: string;
}

export interface WorkflowOptionsResponse {
  options: WorkflowOption[];
  after?: string;
  searchable: true;
}
