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
import { aiTools } from './tools/ai.js'
import { storageTools } from './tools/storage.js'
import { realtimeTools } from './tools/realtime.js'
import { ragTools } from './tools/rag.js'
import { notificationTools } from './tools/notifications.js'
import { connectorTools } from './tools/connectors.js'
import { webTools } from './tools/web.js'
import { agentTools } from './tools/agents.js'
import { phoneTools } from './tools/phone.js'
import { functionTools } from './tools/functions.js'
import { versionTools } from './tools/versions.js'
import { deployTools } from './tools/deploy.js'

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
  ...aiTools,
  ...storageTools,
  ...realtimeTools,
  ...ragTools,
  ...notificationTools,
  ...connectorTools,
  ...webTools,
  ...agentTools,
  ...phoneTools,
  ...functionTools,
  ...versionTools,
  ...deployTools,
}

const server = new McpServer({
  name: 'blink',
  version: '1.1.0',
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
