import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { KnowledgeBase } from '~/types/knowledge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const raw = readFileSync(join(__dirname, '../data/knowledge_data.json'), 'utf-8');
const knowledge: KnowledgeBase = JSON.parse(raw);

export function getKnowledge(): KnowledgeBase {
  return knowledge;
}
