import { LLMClient } from '../LLMClient';

export class StatsGenerator {
  constructor(private client: LLMClient) {}

  async generate(prompt: string): Promise<Record<string, unknown>> {
    const systemPrompt = `You are a game designer. Generate RPG character stats as JSON.
Return ONLY valid JSON, no explanation.

Schema:
{
  "template": "rpg",
  "base": {
    "hp": number,
    "mp": number,
    "str": number,
    "dex": number,
    "int": number,
    "atk": number,
    "def": number,
    "spd": number
  },
  "custom": {
    "attributeName": { "type": "number", "value": number }
  }
}

Balance guidelines: total base stats should be around 50-60 for a starting character. Scale based on the character description.`;

    return this.client.generateJSON<Record<string, unknown>>(systemPrompt, prompt);
  }
}
