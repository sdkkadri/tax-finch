import { z } from "zod";

/**
 * Zod schema for validating database configuration from environment variables.
 * This schema ensures all required PostgreSQL configuration is present and valid.
 */
const DatabaseConfigSchema = z.object({
  // PostgreSQL configuration
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default(5432),
  POSTGRES_DATABASE: z.string(),
  POSTGRES_USERNAME: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_SSL: z.string().transform(val => val === "true").default(false),
  
  // Connection pool settings
  DATABASE_POOL_MAX: z.string().transform(Number).pipe(z.number().min(1)).default(10),
  DATABASE_TIMEOUT: z.string().transform(Number).pipe(z.number().min(1000)).default(30000),
  
  // Environment
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
});

/**
 * TypeScript type representing the validated database configuration.
 * This type is automatically inferred from the Zod schema and provides
 * type safety for all database configuration values.
 */
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

/**
 * Loads and validates database configuration from environment variables.
 * 
 * This function reads all database-related environment variables, validates them
 * against the DatabaseConfigSchema, and returns a fully typed configuration object.
 * If validation fails, it throws an error with details about what went wrong.
 * 
 * @returns {DatabaseConfig} A validated database configuration object
 * @throws {Error} When environment variables are missing or invalid
 * 
 * @example
 * ```typescript
 * try {
 *   const config = loadDatabaseConfig();
 *   console.log(`Connecting to ${config.POSTGRES_HOST}:${config.POSTGRES_PORT}`);
 * } catch (error) {
 *   console.error('Database configuration error:', error.message);
 * }
 * ```
 */
export function loadDatabaseConfig(): DatabaseConfig {
  try {
    const config = DatabaseConfigSchema.parse(process.env);
    return config;
  } catch (error) {
    console.error("Invalid database configuration:", error);
    throw new Error("Failed to load database configuration");
  }
}

/**
 * Generates a PostgreSQL connection string from the provided configuration.
 * 
 * This function takes a validated DatabaseConfig object and constructs a proper
 * PostgreSQL connection string that can be used by database drivers. The connection
 * string includes all necessary parameters like host, port, database name, username,
 * password, and SSL settings.
 * 
 * @param {DatabaseConfig} config - The validated database configuration object
 * @returns {string} A PostgreSQL connection string in the format: postgresql://[params]
 * @throws {Error} When required PostgreSQL configuration is incomplete
 * 
 * @example
 * ```typescript
 * const config = loadDatabaseConfig();
 * const connectionString = getDatabaseConnectionString(config);
 * // Returns: postgresql://host=localhost&port=5432&database=tax_finch_dev&user=postgres&password=password&ssl=false
 * ```
 */
export function getDatabaseConnectionString(config: DatabaseConfig): string {
  if (!config.POSTGRES_HOST || !config.POSTGRES_DATABASE) {
    throw new Error("PostgreSQL configuration incomplete");
  }
  
  // Build PostgreSQL connection string in the correct format
  const connectionString = `postgresql://${config.POSTGRES_USERNAME}:${config.POSTGRES_PASSWORD}@${config.POSTGRES_HOST}:${config.POSTGRES_PORT}/${config.POSTGRES_DATABASE}?sslmode=${config.POSTGRES_SSL ? 'require' : 'disable'}`;
  
  return connectionString;
}

/**
 * Extracts connection pool configuration from the database configuration.
 * 
 * This function provides a clean interface for accessing connection pool settings
 * that can be passed directly to database connection libraries. It returns an
 * object with min, max, and timeout values for connection pooling.
 * 
 * @param {DatabaseConfig} config - The validated database configuration object
 * @returns {Object} Connection pool configuration with min, max, and timeout values
 * 
 * @example
 * ```typescript
 * const config = loadDatabaseConfig();
 * const poolConfig = getConnectionPoolConfig(config);
 * // Returns: { min: 2, max: 10, timeout: 30000 }
 * 
 * // Use with postgres library
 * const sql = postgres(connectionString, {
 *   max: poolConfig.max,
 *   min: poolConfig.min,
 *   idle_timeout: poolConfig.timeout,
 * });
 * ```
 */
export function getConnectionPoolConfig(config: DatabaseConfig) {
  return {
    max: config.DATABASE_POOL_MAX,
    timeout: config.DATABASE_TIMEOUT,
  };
}

/**
 * Validates that the PostgreSQL configuration contains all required fields.
 * 
 * This function performs a basic validation check to ensure that the minimum
 * required PostgreSQL configuration is present. It checks for the existence of
 * host and database name, which are essential for establishing a connection.
 * 
 * @param {DatabaseConfig} config - The database configuration object to validate
 * @returns {boolean} True if the configuration is valid, false otherwise
 * 
 * @example
 * ```typescript
 * const config = loadDatabaseConfig();
 * if (validateDatabaseConfig(config)) {
 *   console.log('Configuration is valid');
 * } else {
 *   console.log('Configuration is missing required fields');
 * }
 * ```
 */
export function validateDatabaseConfig(config: DatabaseConfig): boolean {
  try {
    return !!(config.POSTGRES_HOST && config.POSTGRES_DATABASE);
  } catch {
    return false;
  }
}

/**
 * Default database configuration for development environments.
 * 
 * This object provides sensible defaults for local development. It should not
 * be used in production environments. In production, all configuration should
 * come from environment variables for security and flexibility.
 * 
 * @example
 * ```typescript
 * // For development/testing only
 * const config = defaultConfig;
 * 
 * // For production, always use environment variables
 * const config = loadDatabaseConfig();
 * ```
 */
export const defaultConfig: DatabaseConfig = {
  POSTGRES_HOST: "localhost",
  POSTGRES_PORT: 5432,
  POSTGRES_DATABASE: "tax_finch_dev",
  POSTGRES_USERNAME: "postgres",
  POSTGRES_PASSWORD: "password",
  POSTGRES_SSL: false,

  DATABASE_POOL_MAX: 10,
  DATABASE_TIMEOUT: 30000,
  NODE_ENV: "development",
};
