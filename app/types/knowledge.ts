export interface KnowledgeDocument {
  id: string;
  topic: string;
  content: string;
  tags: string[];
  last_updated: string;
  status: "current" | "deprecated";
}

export interface Expert {
  name: string;
  handle: string | null; // null is a real value in the data (Karel Dvorak has no handle)
  skills: string[];
  availability: string; // "available" | "on_leave_until_YYYY-MM-DD" | etc.
}

export interface KnowledgeBase {
  knowledge_base: KnowledgeDocument[];
  experts: Expert[];
}
