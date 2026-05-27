import { LLMClient } from '../LLMClient';

export interface GeneratedItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  stackable: boolean;
  maxStack: number;
  buyPrice: number;
  sellPrice: number;
  equipSlot?: string;
  stats?: Record<string, number>;
  effects?: Array<{ trigger: string; description: string }>;
  requirements?: Record<string, number>;
}

export class ItemGenerator {
  constructor(private client: LLMClient) {}

  async generate(prompt: string): Promise<GeneratedItem> {
    const systemPrompt = `You are a game item designer. Generate an item definition as JSON.
Return ONLY valid JSON, no explanation.

Schema:
{
  "id": "kebab-case-id",
  "name": "display name",
  "description": "flavor text",
  "type": "weapon|armor|consumable|material|key|accessory",
  "rarity": "common|uncommon|rare|epic|legendary",
  "stackable": boolean,
  "maxStack": number,
  "buyPrice": number,
  "sellPrice": number,
  "equipSlot": "mainHand|offHand|head|body|feet|accessory1|accessory2" (only for equippable),
  "stats": { "atk": number, "def": number, ... } (only for equippable),
  "effects": [{ "trigger": "onUse|onEquip|onHit|passive", "description": "what it does" }],
  "requirements": { "level": number, "str": number, ... }
}

Balance guidelines: common items have small bonuses, legendary items have powerful but not game-breaking effects.`;

    return this.client.generateJSON<GeneratedItem>(systemPrompt, prompt);
  }
}
