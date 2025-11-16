#!/usr/bin/env node
const fs = require('node:fs/promises')
const path = require('node:path')

async function main() {
  const [, , inputPath, apiBaseArg] = process.argv
  if (!inputPath) {
    console.error('Usage: npm run import-board -- <path-to-board.json> [api-base-url]')
    process.exit(1)
  }

  const apiBase = (apiBaseArg || process.env.API_BASE || 'http://localhost:3000').replace(/\/$/, '')
  const endpoint = `${apiBase}/api/boards`

  const absolutePath = path.resolve(process.cwd(), inputPath)

  try {
    const raw = await fs.readFile(absolutePath, 'utf8')
    const payload = JSON.parse(raw)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Request failed (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    const boardName = data?.name || data?.board?.name || payload.name || '(unnamed board)'
    const boardId = data?._id || data?.board?._id || data?.board?.id || payload.id || '(id unknown)'
    console.log(`Imported board "${boardName}" (${boardId}) via ${endpoint}`)
  } catch (err) {
    console.error('Failed to import board:')
    console.error(err.message || err)
    process.exit(1)
  }
}

main()
