/**
 * =============================================================================
 * DATABASE CONNECTION - Janji.in Booking Platform
 * =============================================================================
 * 
 * This module sets up the PostgreSQL database connection using Drizzle ORM.
 * 
 * CONFIGURATION:
 * - Uses DATABASE_URL environment variable for connection string
 * - Connection pooling is handled automatically by pg.Pool
 * 
 * USAGE:
 * ```typescript
 * import { db } from "./db";
 * 
 * // Query example
 * const users = await db.select().from(schema.users);
 * 
 * // Insert example
 * await db.insert(schema.users).values({ email: "test@example.com" });
 * ```
 * 
 * DEBUGGING:
 * - Check DATABASE_URL is set correctly in environment
 * - Verify PostgreSQL is running and accessible
 * - Check connection limits if pool exhaustion occurs
 * 
 * @file server/db.ts
 * @author Janji.in Team
 * =============================================================================
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

/**
 * PostgreSQL connection pool
 * Automatically manages connections to the database
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Drizzle ORM database instance
 * Use this to run queries against the database
 */
export const db = drizzle(pool, { schema });
