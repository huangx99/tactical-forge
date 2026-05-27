export interface AIConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  temperature?: number;
}

export class LLMClient {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  updateConfig(config: Partial<AIConfig>): void {
    Object.assign(this.config, config);
  }

  getConfig(): Readonly<AIConfig> {
    return { ...this.config };
  }

  async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: this.config.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  async generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const raw = await this.generate(systemPrompt, userPrompt);
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in LLM response');
    return JSON.parse(jsonMatch[1] ?? jsonMatch[0]) as T;
  }
}
