import { LLMClient } from '../LLMClient';

export interface GeneratedSkill {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  mpCost: number;
  cooldown: number;
  castTime: number;
  range: number;
  targetType: string;
  areaRadius?: number;
  maxLevel: number;
  levelScaling: Record<string, string>;
  effects: Array<{ type: string; value: number; element?: string; statusId?: string; chance?: number }>;
}

export class SkillGenerator {
  constructor(private client: LLMClient) {}

  async generate(prompt: string): Promise<GeneratedSkill> {
    const systemPrompt = `You are a game skill designer. Generate a skill definition as JSON.
Return ONLY valid JSON, no explanation.

Schema:
{
  "id": "kebab-case-id",
  "name": "display name",
  "description": "what the skill does",
  "type": "active|passive|toggle",
  "category": "magic|melee|ranged|support",
  "mpCost": number,
  "cooldown": seconds,
  "castTime": seconds,
  "range": pixels,
  "targetType": "self|single|area|cone|line",
  "areaRadius": number (if area),
  "maxLevel": number,
  "levelScaling": { "damage": "+10", "mpCost": "+2", "cooldown": "-0.1" },
  "effects": [
    { "type": "damage|heal|applyStatus", "value": number, "element": "physical|fire|ice|lightning|poison|holy|dark", "statusId": "id", "chance": 0.0-1.0 }
  ]
}

Balance: basic skills cost 5-10 MP, advanced skills 15-30 MP. Cooldowns scale with power.`;

    return this.client.generateJSON<GeneratedSkill>(systemPrompt, prompt);
  }
}
