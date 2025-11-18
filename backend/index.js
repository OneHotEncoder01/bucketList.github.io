// Gamified achievement board API built on Express + MongoDB
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.DB_NAME || 'FocusFrame'
const COLLECTION = 'boards'

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env')
  process.exit(1)
}

const STATUS_VALUES = ['locked', 'tracking', 'completed', 'mastered']
const RARITY_VALUES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']
const ICONS = ['🗡️', '🛡️', '🧭', '🏹', '🧪', '📜', '⚒️', '🌿', '💎', '🔥', '🌙', '🛠️', '🎯']
const DEFAULT_ICON = '⭐'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const toNumber = (value, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}
const randomIcon = () => ICONS[Math.floor(Math.random() * ICONS.length)] || DEFAULT_ICON

function normalizeAchievementData(data = {}, { fallbackIcon = DEFAULT_ICON } = {}) {
  const xp = toNumber(data.xp, 0)
  const total = Math.max(1, toNumber(data.progress?.total ?? data.progressTotal, 1))
  const currentRaw = toNumber(data.progress?.current ?? data.progressCurrent, 0)
  const current = clamp(currentRaw, 0, total)
  const status = STATUS_VALUES.includes(data.status) ? data.status : 'locked'
  const rarity = RARITY_VALUES.includes(data.rarity) ? data.rarity : 'common'
  const icon = typeof data.icon === 'string' && data.icon.trim().length > 0 ? data.icon.trim() : fallbackIcon
  const tags = Array.isArray(data.tags) ? Array.from(new Set(data.tags.map((tag) => String(tag)))) : []
  const dependsOn = Array.isArray(data.dependsOn) ? data.dependsOn.map((dep) => String(dep)) : []
  const timeline = {
    createdAt: data.timeline?.createdAt
      ? new Date(data.timeline.createdAt)
      : data.createdAt
        ? new Date(data.createdAt)
        : null,
    unlockedAt: data.timeline?.unlockedAt ? new Date(data.timeline.unlockedAt) : null,
    completedAt: data.timeline?.completedAt ? new Date(data.timeline.completedAt) : null,
  }

  return {
    label: typeof data.label === 'string' && data.label.trim().length > 0
      ? data.label.trim()
      : typeof data.title === 'string' && data.title.trim().length > 0
        ? data.title.trim()
        : 'New Achievement',
    name: typeof data.name === 'string' && data.name.trim().length > 0
      ? data.name.trim()
      : typeof data.label === 'string' && data.label.trim().length > 0
        ? data.label.trim()
        : 'New Achievement',
    description: typeof data.description === 'string' ? data.description : '',
    status,
    rarity,
    xp,
    reward: typeof data.reward === 'string' ? data.reward : '',
    icon,
    tags,
    progress: { current, total },
    dependsOn,
    timeline,
  }
}

function ensureTimelineDefaults(data) {
  const normalized = { ...data, timeline: { ...data.timeline } }
  if (!normalized.timeline.createdAt) normalized.timeline.createdAt = new Date()
  if (
    (normalized.status === 'tracking' || normalized.status === 'completed' || normalized.status === 'mastered') &&
    !normalized.timeline.unlockedAt
  ) {
    normalized.timeline.unlockedAt = new Date()
  }
  if (
    (normalized.status === 'completed' || normalized.status === 'mastered') &&
    normalized.progress.current >= normalized.progress.total &&
    !normalized.timeline.completedAt
  ) {
    normalized.timeline.completedAt = new Date()
  }
  return normalized
}

function createAchievementNode(payload = {}) {
  const id = String(payload.id || payload._id || `ach-${new ObjectId().toString()}`)
  const baseData = payload.data && typeof payload.data === 'object' ? payload.data : payload
  const normalizedData = ensureTimelineDefaults(
    normalizeAchievementData(baseData, { fallbackIcon: baseData?.icon || randomIcon() })
  )

  return {
    id,
    type: payload.type || 'achievement',
    position: {
      x: toNumber(payload.position?.x, 0),
      y: toNumber(payload.position?.y, 0),
    },
    targetPosition: payload.targetPosition || 'left',
    sourcePosition: payload.sourcePosition || 'right',
    data: {
      ...normalizedData,
      progress: {
        current: clamp(normalizedData.progress.current, 0, normalizedData.progress.total),
        total: normalizedData.progress.total,
      },
    },
  }
}

function normalizeNodeFromDb(node, index = 0) {
  if (!node || typeof node !== 'object') return null
  const id = String(node.id || node._id || `ach-${index}`)
  const baseData = node.data && typeof node.data === 'object' ? node.data : node
  const normalizedData = ensureTimelineDefaults(
    normalizeAchievementData(baseData, { fallbackIcon: baseData?.icon || DEFAULT_ICON })
  )

  return {
    id,
    type: node.type || 'achievement',
    position: {
      x: toNumber(node.position?.x, 0),
      y: toNumber(node.position?.y, 0),
    },
    targetPosition: node.targetPosition || 'left',
    sourcePosition: node.sourcePosition || 'right',
    data: {
      ...normalizedData,
      progress: {
        current: clamp(normalizedData.progress.current, 0, normalizedData.progress.total),
        total: normalizedData.progress.total,
      },
    },
  }
}

function normalizeEdgeFromDb(edge, index = 0) {
  if (!edge || typeof edge !== 'object') return null
  const source = String(edge.source ?? '')
  const target = String(edge.target ?? '')
  if (!source || !target) return null

  return {
    id: String(edge.id || `${source}-${target}-${index}`),
    source,
    target,
    type: edge.type || 'smoothstep',
    animated: Boolean(edge.animated),
    label: edge.label ?? undefined,
    data: edge.data ?? undefined,
  }
}

function prepareNodes(nodes = []) {
  return nodes
    .filter((node) => node && typeof node === 'object')
    .map((node, index) => createAchievementNode({ ...node, id: node.id || `ach-${index}` }))
}

function prepareEdges(edges = []) {
  return edges
    .filter((edge) => edge && typeof edge === 'object')
    .map((edge, index) => normalizeEdgeFromDb(edge, index))
}

function calculateBoardStats(nodes = []) {
  const statusCounts = STATUS_VALUES.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})
  const rarityCounts = RARITY_VALUES.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})

  let xpTotal = 0
  let xpCompleted = 0
  let stepsDone = 0
  let stepsTotal = 0

  nodes.forEach((node) => {
    const status = node.data?.status ?? 'locked'
    const rarity = node.data?.rarity ?? 'common'
    const xp = toNumber(node.data?.xp, 0)
    const nodeTotal = Math.max(1, toNumber(node.data?.progress?.total, 1))
    const nodeCurrent = clamp(toNumber(node.data?.progress?.current, 0), 0, nodeTotal)

    if (statusCounts[status] !== undefined) statusCounts[status] += 1
    else statusCounts[status] = 1
    if (rarityCounts[rarity] !== undefined) rarityCounts[rarity] += 1
    else rarityCounts[rarity] = 1

    xpTotal += xp
    if (status === 'completed' || status === 'mastered') xpCompleted += xp

    stepsTotal += nodeTotal
    stepsDone += nodeCurrent
  })

  const completionRatio = stepsTotal > 0 ? stepsDone / stepsTotal : 0
  const xpPerLevel = 250
  const level = Math.floor(xpCompleted / xpPerLevel) + 1
  const xpIntoLevel = xpCompleted % xpPerLevel
  const xpToNext = xpPerLevel - xpIntoLevel

  return {
    total: nodes.length,
    status: statusCounts,
    rarity: rarityCounts,
    xpTotal,
    xpCompleted,
    stepsTotal,
    stepsDone,
    completionRatio,
    xpPerLevel,
    level,
    xpIntoLevel,
    xpToNext,
  }
}

function buildBoardPayload(body = {}, existing = {}) {
  const now = new Date()
  const sourceNodes = Array.isArray(body.nodes) ? body.nodes : existing.nodes || []
  const sourceEdges = Array.isArray(body.edges) ? body.edges : existing.edges || []

  return {
    name: body.name || existing.name || 'Untitled',
    description: body.description || existing.description || '',
    ownerId: body.ownerId || existing.ownerId || null,
    nodes: prepareNodes(sourceNodes),
    edges: prepareEdges(sourceEdges),
    layout: body.layout || existing.layout || { direction: 'TB' },
    settings: body.settings || existing.settings || {},
    theme: body.theme || existing.theme || { palette: 'overworld', accent: '#22c55e' },
    createdAt: existing.createdAt ? new Date(existing.createdAt) : body.createdAt ? new Date(body.createdAt) : now,
    updatedAt: now,
  }
}

function formatBoard(doc) {
  if (!doc) return null
  const nodes = Array.isArray(doc.nodes)
    ? doc.nodes.map((node, index) => normalizeNodeFromDb(node, index)).filter(Boolean)
    : []
  const edges = Array.isArray(doc.edges)
    ? doc.edges.map((edge, index) => normalizeEdgeFromDb(edge, index)).filter(Boolean)
    : []
  const stats = calculateBoardStats(nodes)
  const progression = {
    level: stats.level,
    xpTotal: stats.xpCompleted,
    xpIntoLevel: stats.xpIntoLevel,
    xpToNext: stats.xpToNext,
    completionRatio: stats.completionRatio,
    stepsDone: stats.stepsDone,
    stepsTotal: stats.stepsTotal,
  }

  return {
    ...doc,
    nodes,
    edges,
    stats,
    progression,
    theme: doc.theme || { palette: 'overworld', accent: '#22c55e' },
  }
}

function parseObjectId(value) {
  try {
    return new ObjectId(String(value))
  } catch (err) {
    return null
  }
}

async function mutateBoardDocument(collection, boardId, mutator) {
  const boardDoc = await collection.findOne({ _id: boardId })
  if (!boardDoc) return null

  boardDoc.nodes = Array.isArray(boardDoc.nodes) ? boardDoc.nodes : []
  boardDoc.edges = Array.isArray(boardDoc.edges) ? boardDoc.edges : []

  const payload = await mutator(boardDoc)

  boardDoc.updatedAt = new Date()

  await collection.updateOne(
    { _id: boardId },
    {
      $set: {
        nodes: boardDoc.nodes,
        edges: boardDoc.edges,
        updatedAt: boardDoc.updatedAt,
      },
    }
  )

  const updatedDoc = await collection.findOne({ _id: boardId })
  return { board: formatBoard(updatedDoc), payload }
}

async function start() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(DB_NAME)
  const boards = db.collection(COLLECTION)

  console.log('MongoDB connected')
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '[REDACTED]' : '(not set)')
  console.log('Using database:', DB_NAME, 'collection:', COLLECTION)
  try {
    const cnt = await boards.countDocuments()
    console.log('Current boards count:', cnt)
  } catch (err) {
    console.warn('Failed to count documents:', err.message)
  }

  app.get('/api/boards', async (req, res) => {
    try {
      const list = await boards
        .find({}, { projection: { name: 1, updatedAt: 1, createdAt: 1, description: 1 } })
        .sort({ updatedAt: -1 })
        .toArray()
      res.json(list)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: String(err) })
    }
  })

  app.post('/api/boards', async (req, res) => {
    try {
      const body = req.body || {}
      if (!body.name || typeof body.name !== 'string') {
        return res.status(400).json({ message: 'name is required' })
      }
      const payload = buildBoardPayload(body)
      const result = await boards.insertOne(payload)
      const created = await boards.findOne({ _id: result.insertedId })
      res.status(201).json(formatBoard(created))
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: String(err) })
    }
  })

  app.get('/api/boards/:id', async (req, res) => {
    try {
      const boardId = parseObjectId(req.params.id)
      if (!boardId) return res.status(400).json({ message: 'invalid id' })
      const doc = await boards.findOne({ _id: boardId })
      if (!doc) return res.status(404).json({ message: 'not found' })
      res.json(formatBoard(doc))
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: String(err) })
    }
  })

  app.put('/api/boards/:id', async (req, res) => {
    try {
      const boardId = parseObjectId(req.params.id)
      if (!boardId) return res.status(400).json({ message: 'invalid id' })
      const existing = await boards.findOne({ _id: boardId })
      const payload = buildBoardPayload(req.body || {}, existing || {})
      await boards.replaceOne({ _id: boardId }, payload, { upsert: true })
      const updated = await boards.findOne({ _id: boardId })
      res.json(formatBoard(updated))
    } catch (err) {
      console.error(err)
      res.status(400).json({ message: 'invalid id or body' })
    }
  })

  app.delete('/api/boards/:id', async (req, res) => {
    try {
      const boardId = parseObjectId(req.params.id)
      if (!boardId) return res.status(400).json({ message: 'invalid id' })
      await boards.deleteOne({ _id: boardId })
      res.json({ message: 'deleted' })
    } catch (err) {
      console.error(err)
      res.status(400).json({ message: 'invalid id' })
    }
  })

  app.post('/api/boards/:id/achievements', async (req, res) => {
    try {
      const boardId = parseObjectId(req.params.id)
      if (!boardId) return res.status(400).json({ message: 'invalid board id' })
      const parentId = req.body?.parentId ? String(req.body.parentId) : null

      const result = await mutateBoardDocument(boards, boardId, (doc) => {
        const node = createAchievementNode(req.body || {})
        if (doc.nodes.some((existing) => String(existing.id) === node.id)) {
          const err = new Error('duplicate achievement id')
          err.code = 'duplicate'
          throw err
        }
        doc.nodes.push(node)
        let edge = null
        if (parentId) {
          edge = {
            id: req.body?.edgeId || `${parentId}-${node.id}`,
            source: parentId,
            target: node.id,
            type: req.body?.edgeType || 'smoothstep',
          }
          doc.edges.push(edge)
        }
        return { nodeId: node.id, edgeId: edge?.id || null }
      })

      if (!result) return res.status(404).json({ message: 'board not found' })

      const createdNode = result.board.nodes.find((node) => node.id === result.payload.nodeId) || null
      const createdEdge = result.payload.edgeId
        ? result.board.edges.find((edge) => edge.id === result.payload.edgeId) || null
        : null

      res.status(201).json({ node: createdNode, edge: createdEdge, board: result.board })
    } catch (err) {
      if (err.code === 'duplicate') {
        return res.status(409).json({ message: 'achievement with that id already exists' })
      }
      console.error(err)
      res.status(500).json({ message: String(err.message || err) })
    }
  })

  app.patch('/api/boards/:id/achievements/:achievementId', async (req, res) => {
    try {
      const boardId = parseObjectId(req.params.id)
      if (!boardId) return res.status(400).json({ message: 'invalid board id' })
      const achievementId = String(req.params.achievementId)

      const result = await mutateBoardDocument(boards, boardId, (doc) => {
        const index = doc.nodes.findIndex((node) => String(node.id) === achievementId)
        if (index === -1) {
          const err = new Error('achievement not found')
          err.code = 'not-found'
          throw err
        }
        const target = doc.nodes[index]
        const incomingData = req.body || {}
        const mergedData = {
          ...target.data,
          ...(incomingData.data && typeof incomingData.data === 'object' ? incomingData.data : {}),
        }

        if (incomingData.title !== undefined || incomingData.label !== undefined) {
          const title = incomingData.title ?? incomingData.label
          mergedData.label = String(title)
          mergedData.name = String(incomingData.name ?? title)
        }
        if (incomingData.name !== undefined) mergedData.name = String(incomingData.name)
        if (incomingData.description !== undefined) mergedData.description = String(incomingData.description)
        if (incomingData.status !== undefined) mergedData.status = incomingData.status
        if (incomingData.rarity !== undefined) mergedData.rarity = incomingData.rarity
        if (incomingData.reward !== undefined) mergedData.reward = incomingData.reward
        if (incomingData.icon !== undefined) mergedData.icon = incomingData.icon
        if (incomingData.xp !== undefined) mergedData.xp = incomingData.xp
        if (incomingData.tags !== undefined) mergedData.tags = incomingData.tags
        if (incomingData.dependsOn !== undefined) mergedData.dependsOn = incomingData.dependsOn

        if (incomingData.progress && typeof incomingData.progress === 'object') {
          mergedData.progress = {
            ...target.data?.progress,
            ...incomingData.progress,
          }
        }
        if (incomingData.progressTotal !== undefined || incomingData.progressCurrent !== undefined) {
          mergedData.progress = {
            ...target.data?.progress,
            total: incomingData.progressTotal ?? target.data?.progress?.total,
            current: incomingData.progressCurrent ?? target.data?.progress?.current,
          }
        }

        if (incomingData.timeline && typeof incomingData.timeline === 'object') {
          mergedData.timeline = {
            ...target.data?.timeline,
            ...incomingData.timeline,
          }
        }

        const updatedNode = createAchievementNode({
          ...target,
          ...incomingData,
          id: achievementId,
          position: {
            x: incomingData.position?.x ?? target.position?.x ?? 0,
            y: incomingData.position?.y ?? target.position?.y ?? 0,
          },
          data: mergedData,
          sourcePosition: incomingData.sourcePosition || target.sourcePosition || 'right',
          targetPosition: incomingData.targetPosition || target.targetPosition || 'left',
        })

        doc.nodes[index] = updatedNode
        return { nodeId: achievementId }
      })

      if (!result) return res.status(404).json({ message: 'board not found' })
      const updatedNode = result.board.nodes.find((node) => node.id === achievementId)
      res.json({ node: updatedNode, board: result.board })
    } catch (err) {
      if (err.code === 'not-found') {
        return res.status(404).json({ message: 'achievement not found' })
      }
      console.error(err)
      res.status(500).json({ message: String(err.message || err) })
    }
  })

  app.post('/api/boards/:id/achievements/:achievementId/progress', async (req, res) => {
    try {
      const boardId = parseObjectId(req.params.id)
      if (!boardId) return res.status(400).json({ message: 'invalid board id' })
      const achievementId = String(req.params.achievementId)
      const delta = toNumber(req.body?.delta ?? 1, 0)
      const mode = req.body?.mode === 'set' ? 'set' : 'increment'
      const explicitStatus = req.body?.status

      const result = await mutateBoardDocument(boards, boardId, (doc) => {
        const index = doc.nodes.findIndex((node) => String(node.id) === achievementId)
        if (index === -1) {
          const err = new Error('achievement not found')
          err.code = 'not-found'
          throw err
        }
        const target = doc.nodes[index]
        const mergedData = { ...target.data, timeline: { ...target.data?.timeline } }
        const total = Math.max(1, toNumber(req.body?.total ?? req.body?.progressTotal ?? mergedData.progress?.total, mergedData.progress?.total || 1))
        let current = toNumber(mergedData.progress?.current, 0)

        if (mode === 'set') {
          current = toNumber(req.body?.value ?? req.body?.progressCurrent, current)
        } else {
          current += delta
        }

        current = clamp(current, 0, total)

        mergedData.progress = {
          total,
          current,
        }

        let status = explicitStatus || mergedData.status || 'locked'
        if (!explicitStatus) {
          if (current >= total) status = 'completed'
          else if (current > 0 && status === 'locked') status = 'tracking'
        }
        mergedData.status = status

        const now = new Date()
        if (status !== 'locked' && !mergedData.timeline.unlockedAt) mergedData.timeline.unlockedAt = now
        if ((status === 'completed' || status === 'mastered') && current >= total) {
          mergedData.timeline.completedAt = mergedData.timeline.completedAt || now
        }
        if (status === 'locked' && req.body?.resetUnlock) {
          mergedData.timeline.unlockedAt = null
          mergedData.timeline.completedAt = null
        }
        if (req.body?.resetCompletion) {
          mergedData.timeline.completedAt = null
          if (status === 'completed') mergedData.timeline.completedAt = now
        }

        doc.nodes[index] = createAchievementNode({
          ...target,
          id: achievementId,
          position: target.position,
          data: mergedData,
        })
        return { nodeId: achievementId }
      })

      if (!result) return res.status(404).json({ message: 'board not found' })
      const updatedNode = result.board.nodes.find((node) => node.id === achievementId)
      res.json({ node: updatedNode, board: result.board })
    } catch (err) {
      if (err.code === 'not-found') {
        return res.status(404).json({ message: 'achievement not found' })
      }
      console.error(err)
      res.status(500).json({ message: String(err.message || err) })
    }
  })

  app.delete('/api/boards/:id/achievements/:achievementId', async (req, res) => {
    try {
      const boardId = parseObjectId(req.params.id)
      if (!boardId) return res.status(400).json({ message: 'invalid board id' })
      const achievementId = String(req.params.achievementId)

      const result = await mutateBoardDocument(boards, boardId, (doc) => {
        const index = doc.nodes.findIndex((node) => String(node.id) === achievementId)
        if (index === -1) {
          const err = new Error('achievement not found')
          err.code = 'not-found'
          throw err
        }
        doc.nodes.splice(index, 1)
        doc.edges = doc.edges.filter((edge) => edge.source !== achievementId && edge.target !== achievementId)
        return { nodeId: achievementId }
      })

      if (!result) return res.status(404).json({ message: 'board not found' })
      res.json({ board: result.board })
    } catch (err) {
      if (err.code === 'not-found') {
        return res.status(404).json({ message: 'achievement not found' })
      }
      console.error(err)
      res.status(500).json({ message: String(err.message || err) })
    }
  })

  app.get('/api/_debug', async (req, res) => {
    try {
      const count = await boards.countDocuments()
      res.json({ db: DB_NAME, collection: COLLECTION, count })
    } catch (err) {
      res.status(500).json({ message: String(err) })
    }
  })

  app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'FocusFrame API', version: '1.0.0' })
  })

  app.listen(PORT, () => console.log(`Backend API listening on http://localhost:${PORT}`))
}

start().catch((err) => {
  console.error('Failed to start server', err)
  process.exit(1)
})
