import { z } from 'zod'
import { appRequest } from '../lib/api.js'

// Uses the management API (blink.new/api/v1/projects/{id}/databases/sql) which accepts
// workspace API keys (blnk_ak_*). This avoids requiring a project secret key for DB queries.
function dbRequest(projectId: string, sql: string) {
  return appRequest(`/api/v1/projects/${projectId}/databases/sql`, { body: { sql } })
}

export const databaseTools = {
  blink_db_query: {
    description: 'Run a SQL query against the project database (SQLite/libSQL)',
    inputSchema: z.object({
      projectId: z.string(),
      sql: z.string().describe('SQL query to execute'),
    }),
    execute: async (input: { projectId: string; sql: string }) =>
      dbRequest(input.projectId, input.sql),
  },
  blink_db_schema: {
    description: "List all tables in the project database. To inspect columns for a specific table, use blink_db_query with: PRAGMA table_info('tablename')",
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      dbRequest(projectId, "SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name"),
  },
}
