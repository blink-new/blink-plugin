import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { projectTools } from './tools/project.js'
import { envTools } from './tools/env.js'
import { backendTools } from './tools/backend.js'
import { databaseTools } from './tools/database.js'
import { authConfigTools } from './tools/auth-config.js'
import { hostingTools } from './tools/hosting.js'
import { domainTools } from './tools/domains.js'
import { queueTools } from './tools/queue.js'
import { workspaceTools } from './tools/workspace.js'

const allTools = {
  ...projectTools,
  ...envTools,
  ...backendTools,
  ...databaseTools,
  ...authConfigTools,
  ...hostingTools,
  ...domainTools,
  ...queueTools,
  ...workspaceTools,
}

const server = new McpServer({
  name: 'blink',
  version: '1.0.0',
})

for (const [name, tool] of Object.entries(allTools)) {
  server.tool(name, tool.description, tool.inputSchema, async (input) => {
    try {
      const result = await tool.execute(input as any)
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
    } catch (err: any) {
      return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true }
    }
  })
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`)
  process.exit(1)
})
