import { z } from 'zod'
import { resourcesRequest } from '../lib/api.js'

export const databaseTools = {
  blink_db_query: {
    description: 'Run a SQL query against the project database (SQLite/libSQL)',
    inputSchema: z.object({
      projectId: z.string(),
      sql: z.string().describe('SQL query to execute'),
    }),
    execute: async (input: { projectId: string; sql: string }) =>
      resourcesRequest(`/api/db/${input.projectId}/sql`, { body: { sql: input.sql } }),
  },
  blink_db_tables: {
    description: 'List all tables in the project database',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      resourcesRequest(`/api/db/${projectId}/sql`, {
        body: { sql: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name" },
      }),
  },
}
