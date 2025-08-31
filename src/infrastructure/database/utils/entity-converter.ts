/**
 * Generic utility for converting database rows to domain entities
 */
export class EntityConverter {
  /**
   * Generic method to convert database row to any entity
   * @param EntityClass - The entity class constructor
   * @param row - Database row data
   * @returns New entity instance
   */
  static fromRow<T>(
    EntityClass: new (...args: any[]) => T,
    row: any
  ): T {
    // Get constructor parameter names
    const paramNames = this.getConstructorParamNames(EntityClass);
    
    // Map database row to constructor parameters
    const params = paramNames.map(paramName => {
      const value = row[paramName];
      
      // Handle Date fields automatically
      if (paramName.toLowerCase().includes('at') && value) {
        return new Date(value);
      }
      
      return value;
    });
    
    return new EntityClass(...params);
  }

  /**
   * Gets constructor parameter names using reflection
   */
  private static getConstructorParamNames(EntityClass: any): string[] {
    try {
      const constructorStr = EntityClass.toString();
      const paramMatch = constructorStr.match(/constructor\s*\(([^)]*)\)/);
      
      if (paramMatch && paramMatch[1]) {
        return paramMatch[1]
          .split(',')
          .map((param: string) => param.trim())
          .filter((param: string) => param.length > 0);
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }
}
