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
      resourcesRequest(`/api/db/${input.projectId}/sql`, { body: { query: input.sql } }),
  },
  blink_db_schema: {
    description: 'Get full database schema — all tables with column names, types, constraints, and primary keys',
    inputSchema: z.object({ projectId: z.string() }),
    execute: async ({ projectId }: { projectId: string }) =>
      resourcesRequest(`/api/db/${projectId}/sql`, {
        body: {
          query: "SELECT m.name AS table_name, p.cid, p.name AS column_name, p.type, p.notnull, p.dflt_value, p.pk FROM sqlite_master m JOIN pragma_table_info(m.name) p WHERE m.type='table' ORDER BY m.name, p.cid",
        },
      }),
  },
}
