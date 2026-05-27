export class SchemaValidator {
  validate(data: unknown, schema: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof data !== 'object' || data === null) {
      return { valid: false, errors: ['Data must be an object'] };
    }

    const obj = data as Record<string, unknown>;
    const required = schema.required as string[] | undefined;
    const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;

    if (required) {
      for (const key of required) {
        if (!(key in obj)) {
          errors.push(`Missing required field: ${key}`);
        }
      }
    }

    if (properties) {
      for (const [key, propSchema] of Object.entries(properties)) {
        if (key in obj) {
          const expectedType = propSchema.type as string;
          const actualType = typeof obj[key];
          if (expectedType === 'array' && !Array.isArray(obj[key])) {
            errors.push(`Field "${key}" should be an array`);
          } else if (expectedType !== 'array' && actualType !== expectedType) {
            errors.push(`Field "${key}" should be ${expectedType}, got ${actualType}`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
