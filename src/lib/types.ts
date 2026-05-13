export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolName =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export interface ToolInput {
  tool: ToolName;
  label: string;
  active: boolean;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditFormData {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
}

export interface ToolResult {
  tool: ToolName;
  label: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  newSpend: number;
  savings: number;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface AuditOutput {
  results: ToolResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  showConsultationCTA: boolean;
  spendingWell: boolean;
  lowSavingsFound: boolean;
  spendScore: number;
  summaryHints: string[];
}

export type AuditRequest = AuditFormData;

export interface AuditResponse {
  auditId: string;
  output: AuditOutput;
}
