export const REFUSAL_MESSAGE =
  "I'm sorry, I can only help with questions about our internal development processes and tools. If you believe this question was blocked incorrectly, please contact support.";

export const SAFE_FALLBACK_MESSAGE =
  "I'm sorry, I encountered an issue generating a safe response. Please try rephrasing your question or contact support.";

const INJECTION_PATTERNS = [
  'ignore previous instructions',
  'ignore all instructions',
  'output your system prompt',
  'reveal your system prompt',
  'disregard all prior',
  'you are now',
  'pretend you are',
  'repeat the above',
  'act as if',
  'forget your instructions',
];

const LEAKED_PROMPT_PATTERNS = [
  'ONLY use the provided knowledge base',
  'cite your source',
];

export function isInjectionAttempt(message: string): boolean {
  const lower = message.toLowerCase();
  return INJECTION_PATTERNS.some((pattern) => lower.includes(pattern));
}

export function containsLeakedPrompt(response: string): boolean {
  return LEAKED_PROMPT_PATTERNS.some((pattern) => response.includes(pattern));
}
