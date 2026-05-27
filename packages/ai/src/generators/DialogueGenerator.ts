import { LLMClient } from '../LLMClient';
import { Blueprint } from '@tactical-forge/shared';

export class DialogueGenerator {
  constructor(private client: LLMClient) {}

  async generate(prompt: string): Promise<Blueprint> {
    const systemPrompt = `You are a game dialogue designer. Generate a dialogue tree as a Blueprint JSON.
Return ONLY valid JSON, no explanation.

Use these node types:
- event/onInteract: triggers when player interacts (no data)
- action/showDialogue: shows dialogue with text and optional choices
  data: { text: string, choices?: string[] }
- condition/hasItem: checks if player has item
  data: { itemId: string }
- action/addItem: adds item to inventory
  data: { itemId: string, quantity: number }
- action/setFlag: sets a game flag
  data: { flag: string, value: boolean }

Schema:
{
  "id": "generated-uuid",
  "name": "dialogue name",
  "description": "description",
  "nodes": [
    { "id": "node-N", "type": "event/onInteract", "position": {"x":0,"y":0}, "data": {} }
  ],
  "edges": [
    { "id": "e-N", "source": "node-1", "sourcePort": "out", "target": "node-2", "targetPort": "in" }
  ]
}

Port naming: events output "out", conditions output "true"/"false", actions output "out".`;

    return this.client.generateJSON<Blueprint>(systemPrompt, prompt);
  }
}
