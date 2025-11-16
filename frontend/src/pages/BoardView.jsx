import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Background,
  Controls,
  Panel,
  MiniMap,
  ReactFlow,
  ConnectionLineType,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from '@dagrejs/dagre'
import './BoardView.css'

import { MODES, DEFAULT_MODE } from '../config'
import { useLoadGoals } from '../hooks/useLoadGoals'
import AddNodeForm from '../components/AddNodeForm'
import CustomNode from '../components/CustomNode'
import {
  createAchievement,
  deleteAchievement,
  recordAchievementProgress,
  saveBoard,
  updateAchievement,
} from '../api/boards'

const NODE_WIDTH = 280
const NODE_HEIGHT = 180

const STATUS_FILTERS = [
  { id: 'all', label: 'All status' },
  { id: 'locked', label: 'Locked' },
  { id: 'tracking', label: 'Tracking' },
  { id: 'completed', label: 'Completed' },
  { id: 'mastered', label: 'Mastered' },
]

const RARITY_FILTERS = [
  { id: 'all', label: 'All rarity' },
  { id: 'common', label: 'Common' },
  { id: 'uncommon', label: 'Uncommon' },
  { id: 'rare', label: 'Rare' },
  { id: 'epic', label: 'Epic' },
  { id: 'legendary', label: 'Legendary' },
  { id: 'mythic', label: 'Mythic' },
]

const COLOR_MODE_OPTIONS = [
  { id: 'system', label: 'System' },
  { id: 'dark', label: 'Midnight' },
  { id: 'light', label: 'Sunrise' },
]

function layoutElements(nodes = [], edges = [], direction = 'TB') {
  const safeNodes = Array.isArray(nodes) ? nodes : []
  const safeEdges = Array.isArray(edges) ? edges : []

  if (!safeNodes.length) {
    return {
      nodes: safeNodes,
      edges: safeEdges,
    }
  }

  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: direction })

  safeNodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  safeEdges.forEach((edge) => {
    if (edge.source && edge.target) graph.setEdge(edge.source, edge.target)
  })

  dagre.layout(graph)

  const isHorizontal = direction === 'LR'
  const layoutedNodes = safeNodes.map((node) => {
    const dagreNode = graph.node(node.id)
    if (!dagreNode) return node
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: dagreNode.x - NODE_WIDTH / 2,
        y: dagreNode.y - NODE_HEIGHT / 2,
      },
    }
  })

  return {
    nodes: layoutedNodes,
    edges: safeEdges,
  }
}

function buildAchievementPayload(payload = {}) {
  const total = Math.max(1, Number.parseInt(payload.progressTotal, 10) || payload.progressTotal || 1)
  const currentRaw = Number.parseInt(payload.progressCurrent, 10)
  const current = Number.isFinite(currentRaw) ? Math.min(currentRaw, total) : 0

  return {
    title: payload.title,
    label: payload.title,
    name: payload.title,
    description: payload.description,
    parentId: payload.parentId || undefined,
    rarity: payload.rarity,
    status: payload.status,
    xp: Number.parseInt(payload.xp, 10) || 0,
    reward: payload.reward,
    icon: payload.icon,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    progressTotal: total,
    progressCurrent: current,
    progress: {
      total,
      current,
    },
  }
}

export default function BoardView({ boardId, onBack }) {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    loading,
    error,
    board,
    setBoard,
    stats,
    setStats,
    progression,
    setProgression,
  } = useLoadGoals(boardId)

  const [mode, setMode] = useState(DEFAULT_MODE || MODES.BROWSE)
  const [statusFilter, setStatusFilter] = useState('all')
  const [rarityFilter, setRarityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [layoutDir, setLayoutDir] = useState('TB')
  const [colorMode, setColorMode] = useState('dark')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formMode, setFormMode] = useState('add')
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [editInitial, setEditInitial] = useState(null)
  const [mutating, setMutating] = useState(false)
  const [mutationError, setMutationError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [lastSavedAt, setLastSavedAt] = useState(null)

  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  const initializedLayoutRef = useRef(false)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    edgesRef.current = edges
  }, [edges])

  useEffect(() => {
    setMode(DEFAULT_MODE || MODES.BROWSE)
    setStatusFilter('all')
    setRarityFilter('all')
    setSearchTerm('')
    setSelectedNodeId(null)
    setShowAddForm(false)
    setFormMode('add')
    setEditInitial(null)
    setSaveError(null)
    setMutationError(null)
    setLastSavedAt(null)
    initializedLayoutRef.current = false
  }, [boardId])

  useEffect(() => {
    if (!board || typeof board !== 'object') return
    if (board.layout && typeof board.layout.direction === 'string') {
      const direction = board.layout.direction === 'LR' ? 'LR' : 'TB'
      setLayoutDir(direction)
    }
    if (board.theme && typeof board.theme.mode === 'string') {
      setColorMode(board.theme.mode)
    }
  }, [board])

  const syncBoard = useCallback(
    (nextBoard, { selectId, skipEdges } = {}) => {
      if (!nextBoard || typeof nextBoard !== 'object') return

      setBoard(nextBoard)
      setStats(nextBoard.stats ?? null)
      setProgression(nextBoard.progression ?? null)

      if (Array.isArray(nextBoard.nodes)) {
        nodesRef.current = nextBoard.nodes
        setNodes(nextBoard.nodes)
      } else {
        nodesRef.current = []
        setNodes([])
      }

      if (!skipEdges) {
        if (Array.isArray(nextBoard.edges)) {
          edgesRef.current = nextBoard.edges
          setEdges(nextBoard.edges)
        } else {
          edgesRef.current = []
          setEdges([])
        }
      }

      if (nextBoard.layout && typeof nextBoard.layout.direction === 'string') {
        const direction = nextBoard.layout.direction === 'LR' ? 'LR' : 'TB'
        setLayoutDir(direction)
      }

      if (selectId) {
        setSelectedNodeId(selectId)
      } else {
        setSelectedNodeId((prev) =>
          prev && nodesRef.current.some((node) => node.id === prev) ? prev : null
        )
      }

      initializedLayoutRef.current = false
    },
    [setBoard, setEdges, setNodes, setProgression, setStats]
  )

  useEffect(() => {
    if (!nodes.length) return
    if (initializedLayoutRef.current) return
    const { nodes: layouted } = layoutElements(nodes, edges, layoutDir)
    nodesRef.current = layouted
    setNodes(layouted)
    initializedLayoutRef.current = true
  }, [nodes, edges, layoutDir, setNodes])

  const nodeTypes = useMemo(() => ({ achievement: CustomNode, custom: CustomNode }), [])

  const handleRelayout = useCallback(
    (direction) => {
      const nextDirection = direction === 'LR' ? 'LR' : 'TB'
      const { nodes: layouted } = layoutElements(nodesRef.current, edgesRef.current, nextDirection)
      nodesRef.current = layouted
      setNodes(layouted)
      setLayoutDir(nextDirection)
      initializedLayoutRef.current = true
    },
    [setNodes]
  )

  const handleOpenAdd = useCallback(() => {
    setFormMode('add')
    setEditInitial(null)
    setShowAddForm(true)
    setMutationError(null)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowAddForm(false)
    setFormMode('add')
    setEditInitial(null)
  }, [])

  const handleOpenEdit = useCallback((nodeId) => {
    const node = nodesRef.current.find((item) => item.id === nodeId)
    if (!node) return
    const parentEdge = edgesRef.current.find((edge) => edge.target === nodeId)
    setFormMode('edit')
    setEditInitial({
      id: node.id,
      title: node.data?.label ?? node.data?.name ?? node.id,
      description: node.data?.description ?? '',
      parentId: parentEdge?.source ?? '',
      rarity: node.data?.rarity ?? 'common',
      status: node.data?.status ?? 'locked',
      xp: node.data?.xp ?? 0,
      reward: node.data?.reward ?? '',
      icon: node.data?.icon ?? '⭐',
      tags: Array.isArray(node.data?.tags) ? node.data.tags : [],
      progressTotal: node.data?.progress?.total ?? 1,
      progressCurrent: node.data?.progress?.current ?? 0,
    })
    setShowAddForm(true)
    setMutationError(null)
  }, [])

  const handleCreateAchievement = useCallback(
    async (formData) => {
      if (!boardId) return
      setMutating(true)
      setMutationError(null)
      try {
        const payload = buildAchievementPayload(formData)
        const response = await createAchievement(boardId, payload)
        if (response?.board) {
          syncBoard(response.board, { selectId: response.node?.id })
        }
        handleCloseForm()
      } catch (err) {
        setMutationError(err instanceof Error ? err.message : String(err))
      } finally {
        setMutating(false)
      }
    },
    [boardId, handleCloseForm, syncBoard]
  )

  const handleSaveEditedAchievement = useCallback(
    async (formData) => {
      if (!boardId || !selectedNodeId) return
      setMutating(true)
      setMutationError(null)
      try {
        const payload = buildAchievementPayload(formData)
        const previousParent = edgesRef.current.find((edge) => edge.target === selectedNodeId)?.source || ''
        const nextParent = payload.parentId || ''
        const response = await updateAchievement(boardId, selectedNodeId, payload)
        if (response?.board) {
          syncBoard(response.board, {
            selectId: selectedNodeId,
            skipEdges: previousParent !== nextParent,
          })
        }
        if (previousParent !== nextParent) {
          let nextEdges = edgesRef.current.filter((edge) => edge.target !== selectedNodeId)
          if (nextParent) {
            nextEdges = [
              ...nextEdges,
              {
                id: `${nextParent}-${selectedNodeId}`,
                source: nextParent,
                target: selectedNodeId,
                type: 'smoothstep',
              },
            ]
          }
          edgesRef.current = nextEdges
          setEdges(nextEdges)
        }
        handleCloseForm()
      } catch (err) {
        setMutationError(err instanceof Error ? err.message : String(err))
      } finally {
        setMutating(false)
      }
    },
    [boardId, handleCloseForm, selectedNodeId, setEdges, syncBoard]
  )

  const handleDeleteSelected = useCallback(
    async () => {
      if (!boardId || !selectedNodeId) return
      setMutating(true)
      setMutationError(null)
      try {
        const response = await deleteAchievement(boardId, selectedNodeId)
        if (response?.board) {
          syncBoard(response.board)
        } else {
          const nextNodes = nodesRef.current.filter((node) => node.id !== selectedNodeId)
          const nextEdges = edgesRef.current.filter(
            (edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId
          )
          nodesRef.current = nextNodes
          edgesRef.current = nextEdges
          setNodes(nextNodes)
          setEdges(nextEdges)
          setSelectedNodeId(null)
        }
      } catch (err) {
        setMutationError(err instanceof Error ? err.message : String(err))
      } finally {
        setMutating(false)
      }
    },
    [boardId, selectedNodeId, setEdges, setNodes, syncBoard]
  )

  const mutateAchievementProgress = useCallback(
    async (nodeId, body) => {
      if (!boardId || !nodeId) return
      setMutating(true)
      setMutationError(null)
      try {
        const response = await recordAchievementProgress(boardId, nodeId, body)
        if (response?.board) {
          syncBoard(response.board, { selectId: nodeId })
        }
      } catch (err) {
        setMutationError(err instanceof Error ? err.message : String(err))
      } finally {
        setMutating(false)
      }
    },
    [boardId, syncBoard]
  )

  const handleProgressDelta = useCallback(
    (nodeId, delta) => {
      mutateAchievementProgress(nodeId, { delta })
    },
    [mutateAchievementProgress]
  )

  const handleCompleteAchievement = useCallback(
    (node) => {
      if (!node) return
      const total = Math.max(1, Number(node.data?.progress?.total) || 1)
      mutateAchievementProgress(node.id, {
        mode: 'set',
        value: total,
        progressTotal: total,
        progressCurrent: total,
        status: 'completed',
      })
    },
    [mutateAchievementProgress]
  )

  const handleResetAchievement = useCallback(
    (node) => {
      if (!node) return
      mutateAchievementProgress(node.id, {
        mode: 'set',
        value: 0,
        status: 'locked',
        resetUnlock: true,
        resetCompletion: true,
      })
    },
    [mutateAchievementProgress]
  )

  const handleSaveBoard = useCallback(async () => {
    if (!boardId) return
    setSaving(true)
    setSaveError(null)
    try {
      const payload = {
        ...(board && typeof board === 'object'
          ? {
              name: board.name,
              description: board.description,
              ownerId: board.ownerId,
              settings: board.settings,
              theme: board.theme,
            }
          : {}),
        nodes: nodesRef.current,
        edges: edgesRef.current,
        layout: { direction: layoutDir },
      }
      const response = await saveBoard(boardId, payload)
      syncBoard(response, { selectId: selectedNodeId })
      setLastSavedAt(new Date())
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }, [board, boardId, layoutDir, selectedNodeId, syncBoard])

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((prev) => {
        const next = applyNodeChanges(changes, prev)
        nodesRef.current = next
        return next
      })
    },
    [setNodes]
  )

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((prev) => {
        const next = applyEdgeChanges(changes, prev)
        edgesRef.current = next
        return next
      })
    },
    [setEdges]
  )

  const onConnect = useCallback(
    (connection) => {
      setEdges((prev) => {
        const next = addEdge({ ...connection, type: ConnectionLineType.SmoothStep }, prev)
        edgesRef.current = next
        initializedLayoutRef.current = false
        return next
      })
    },
    [setEdges]
  )

  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node?.id ?? null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const onSelectionChange = useCallback((selection) => {
    if (!selection || !Array.isArray(selection.nodes)) return
    if (!selection.nodes.length) {
      setSelectedNodeId(null)
      return
    }
    setSelectedNodeId(selection.nodes[0].id)
  }, [])

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  )

  const displayNodes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return nodes.map((node) => {
      const data = node.data || {}
      const matchesStatus = statusFilter === 'all' || data.status === statusFilter
      const matchesRarity = rarityFilter === 'all' || data.rarity === rarityFilter
      const matchesSearch =
        !term ||
        (typeof data.label === 'string' && data.label.toLowerCase().includes(term)) ||
        (typeof data.description === 'string' && data.description.toLowerCase().includes(term)) ||
        node.id.toLowerCase().includes(term)
      const isSelected = node.id === selectedNodeId
      const dimmed = !isSelected && mode !== MODES.EDIT && !(matchesStatus && matchesRarity && matchesSearch)
      return {
        ...node,
        data: {
          ...data,
          dimmed,
          selected: isSelected,
        },
      }
    })
  }, [mode, nodes, rarityFilter, searchTerm, selectedNodeId, statusFilter])

  const questEntries = useMemo(() => {
    const priority = { tracking: 0, locked: 1, completed: 2, mastered: 3 }
    return nodes
      .filter((node) => {
        const status = node.data?.status ?? 'locked'
        return status !== 'mastered'
      })
      .map((node) => ({
        id: node.id,
        label: node.data?.label ?? node.id,
        status: node.data?.status ?? 'locked',
        progress: {
          current: node.data?.progress?.current ?? 0,
          total: node.data?.progress?.total ?? 1,
        },
      }))
      .sort((a, b) => {
        const statusA = priority[a.status] ?? 99
        const statusB = priority[b.status] ?? 99
        if (statusA !== statusB) return statusA - statusB
        const ratioA = a.progress.total > 0 ? a.progress.current / a.progress.total : 0
        const ratioB = b.progress.total > 0 ? b.progress.current / b.progress.total : 0
        return ratioA - ratioB
      })
  }, [nodes])

  const completionPercent = useMemo(() => {
    if (!stats || !stats.stepsTotal) return 0
    return Math.round((stats.stepsDone / stats.stepsTotal) * 100)
  }, [stats])

  const levelDisplay = useMemo(() => {
    if (!progression) return 'Level 1'
    return `Level ${progression.level} · ${progression.xpIntoLevel}/${progression.xpPerLevel} XP`
  }, [progression])

  const themeAttr = colorMode === 'system' ? undefined : colorMode

  const miniMapNodeColor = useCallback((node) => node?.data?.color ?? '#38bdf8', [])
  const miniMapNodeStroke = useCallback((node) => node?.data?.color ?? '#0f172a', [])

  const miniMapMaskColor = useMemo(() => {
    if (themeAttr === 'light') return 'rgba(248, 250, 252, 0.6)'
    return 'rgba(2, 6, 23, 0.65)'
  }, [themeAttr])

  if (loading) {
    return <div style={{ padding: 16 }}>Loading achievements…</div>
  }

  if (error) {
    return (
      <div style={{ padding: 16, color: '#ef4444' }}>
        Failed to load board: {error instanceof Error ? error.message : String(error)}
      </div>
    )
  }

  return (
    <div className="board-root" data-theme={themeAttr}>
      <div className="board-toolbar">
        <button type="button" className="toolbar-button" onClick={onBack}>
          Back
        </button>
        <div className="toolbar-title">
          <strong>{board?.name ?? 'Achievement Board'}</strong>
          <span>{levelDisplay}</span>
        </div>
        <div className="toolbar-actions">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search achievements…"
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid rgba(148,163,184,0.35)',
              background: 'rgba(15,23,42,0.6)',
              color: 'inherit',
              width: 180,
            }}
          />
          <button type="button" className="toolbar-button" onClick={() => handleRelayout(layoutDir)}>
            Align
          </button>
          <button type="button" className="toolbar-button" onClick={handleSaveBoard} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div className="toolbar-stats" style={{ gridColumn: '1 / -1' }}>
          <span>Total quests: {stats?.total ?? 0}</span>
          <span>Completion: {completionPercent}%</span>
          <span>XP banked: {stats?.xpCompleted ?? 0}</span>
          {lastSavedAt && (
            <span className="toolbar-muted">Saved {lastSavedAt.toLocaleTimeString()}</span>
          )}
        </div>
        <div className="toolbar-modes">
          {[MODES.BROWSE, MODES.EDIT, MODES.FOCUS].map((modeId) => (
            <button
              key={modeId}
              type="button"
              className={mode === modeId ? 'toolbar-mode--active' : 'toolbar-mode'}
              onClick={() => setMode(modeId)}
            >
              {modeId.charAt(0).toUpperCase() + modeId.slice(1)}
            </button>
          ))}
          {mode === MODES.EDIT && (
            <>
              <button type="button" className="toolbar-button" onClick={handleOpenAdd}>
                New achievement
              </button>
              <button
                type="button"
                className="toolbar-button"
                onClick={() => selectedNodeId && handleOpenEdit(selectedNodeId)}
                disabled={!selectedNodeId}
              >
                Edit
              </button>
              <button
                type="button"
                className="toolbar-button"
                onClick={handleDeleteSelected}
                disabled={!selectedNodeId}
              >
                Delete
              </button>
            </>
          )}
        </div>
        {mutationError && (
          <div className="toolbar-error" style={{ gridColumn: '1 / -1' }}>
            {mutationError}
          </div>
        )}
        {saveError && (
          <div className="toolbar-error" style={{ gridColumn: '1 / -1' }}>
            Save failed: {saveError}
          </div>
        )}
      </div>

      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={mode === MODES.EDIT}
        nodesConnectable={mode === MODES.EDIT}
        elementsSelectable
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        minZoom={0.3}
        maxZoom={1.6}
        colorMode={themeAttr}
        proOptions={{ hideAttribution: true }}
        className="achievement-flow"
      >
        <Panel position="top-left" className="panel-row">
          <button type="button" className="toolbar-button" onClick={() => handleRelayout('TB')}>
            Vertical layout
          </button>
          <button type="button" className="toolbar-button" onClick={() => handleRelayout('LR')}>
            Horizontal layout
          </button>
        </Panel>
        <Panel position="top-right" className="panel-row">
          <label>
            <span>Palette</span>
            <select value={colorMode} onChange={(event) => setColorMode(event.target.value)}>
              {COLOR_MODE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {STATUS_FILTERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Rarity</span>
            <select value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value)}>
              {RARITY_FILTERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </Panel>
        <MiniMap
          className="board-flow-minimap"
          maskColor={miniMapMaskColor}
          nodeColor={miniMapNodeColor}
          nodeStrokeColor={miniMapNodeStroke}
          pannable
          zoomable
        />
        <Background className="board-flow-background" gap={24} />
        <Controls className="board-flow-controls" />

        {selectedNode && (
          <Panel position="bottom-right" className="inspector-panel">
            <div className="inspector-header">
              <strong>{selectedNode.data?.label ?? selectedNode.id}</strong>
              <span className="inspector-status">{selectedNode.data?.status ?? 'locked'}</span>
            </div>
            <div className="inspector-body">
              <p>{selectedNode.data?.description || 'No description yet.'}</p>
              <div>
                <strong>Reward:</strong> {selectedNode.data?.reward || 'TBD'}
              </div>
              <div>
                <strong>XP:</strong> {selectedNode.data?.xp ?? 0}
              </div>
              <div className="inspector-progress">
                <span>
                  Progress {selectedNode.data?.progress?.current ?? 0} /
                  {selectedNode.data?.progress?.total ?? 1}
                </span>
                <div className="inspector-progress-bar">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((selectedNode.data?.progress?.current ?? 0) /
                            Math.max(1, selectedNode.data?.progress?.total ?? 1)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
              {selectedNode.data?.tags && selectedNode.data.tags.length > 0 && (
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  Tags: {selectedNode.data.tags.join(', ')}
                </div>
              )}
              <div className="inspector-buttons">
                <button
                  type="button"
                  onClick={() => handleProgressDelta(selectedNode.id, 1)}
                  disabled={mutating}
                >
                  Advance step
                </button>
                <button
                  type="button"
                  onClick={() => handleCompleteAchievement(selectedNode)}
                  disabled={mutating}
                >
                  Mark complete
                </button>
                <button
                  type="button"
                  onClick={() => handleResetAchievement(selectedNode)}
                  disabled={mutating}
                >
                  Reset
                </button>
                {mode === MODES.EDIT && (
                  <button type="button" onClick={() => handleOpenEdit(selectedNode.id)} disabled={mutating}>
                    Edit details
                  </button>
                )}
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {mode === MODES.FOCUS && questEntries.length > 0 && (
        <div className="quest-log">
          <h4>Quest Log</h4>
          <div className="quest-log-list">
            {questEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  setMode(MODES.BROWSE)
                  setSelectedNodeId(entry.id)
                }}
              >
                <span className={`quest-log-status quest-log-status--${entry.status}`}>
                  {entry.status.toUpperCase()}
                </span>
                <span className="quest-log-title">{entry.label}</span>
                <span className="quest-log-progress">
                  {entry.progress.current}/{entry.progress.total}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showAddForm && (
        <AddNodeForm
          nodes={nodesRef.current}
          onAdd={handleCreateAchievement}
          onSave={handleSaveEditedAchievement}
          onCancel={handleCloseForm}
          mode={formMode}
          initialAchievement={formMode === 'edit' ? editInitial ?? undefined : undefined}
        />
      )}
    </div>
  )
}
