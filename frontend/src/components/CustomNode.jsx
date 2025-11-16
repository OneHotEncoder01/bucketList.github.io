import React from 'react'
import { Handle, Position } from '@xyflow/react'

const STATUS_LABELS = {
  locked: 'Locked',
  tracking: 'Tracking',
  completed: 'Completed',
  mastered: 'Mastered',
}

const STATUS_COLORS = {
  locked: '#475569',
  tracking: '#0ea5e9',
  completed: '#22c55e',
  mastered: '#a855f7',
}

const RARITY_COLORS = {
  common: '#94a3b8',
  uncommon: '#34d399',
  rare: '#38bdf8',
  epic: '#c084fc',
  legendary: '#fbbf24',
  mythic: '#f472b6',
}

export default function CustomNode({ data }) {
  const name = data?.name ?? data?.label ?? 'Unnamed'
  const description = data?.description ?? ''
  const icon = data?.icon ?? '⭐'
  const status = data?.status ?? 'locked'
  const rarity = data?.rarity ?? 'common'
  const xp = typeof data?.xp === 'number' ? data.xp : 0
  const progress = data?.progress ?? { current: 0, total: 1 }
  const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0
  const dimmed = Boolean(data?.dimmed)
  const selected = Boolean(data?.selected)

  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.locked
  const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.common

  return (
    <div
      className="achievement-node"
      data-dimmed={dimmed}
      data-selected={selected}
      style={{
        borderColor: selected ? statusColor : 'rgba(148,163,184,0.45)',
        boxShadow: selected
          ? `0 0 0 3px rgba(148, 163, 184, 0.4), 0 16px 32px rgba(15, 23, 42, 0.45)`
          : '0 14px 24px rgba(15, 23, 42, 0.28)',
        opacity: dimmed && !selected ? 0.35 : 1,
        background:
          status === 'completed' || status === 'mastered'
            ? 'linear-gradient(140deg, rgba(34, 197, 94, 0.2), rgba(52, 211, 153, 0.18))'
            : 'linear-gradient(140deg, rgba(30, 41, 59, 0.86), rgba(15, 23, 42, 0.95))',
      }}
    >
      <Handle type="target" position={Position.Left} className="achievement-node__handle" />
      <div className="achievement-node__header">
        <span className="achievement-node__icon" aria-hidden="true">
          {icon}
        </span>
        <div className="achievement-node__title">
          <span className="achievement-node__rarity" style={{ color: rarityColor }}>
            {rarity.toUpperCase()}
          </span>
          <h4>{name}</h4>
        </div>
      </div>
      {description && <p className="achievement-node__description">{description}</p>}
      <div className="achievement-node__progress">
        <div className="achievement-node__progress-bar">
          <div
            className="achievement-node__progress-fill"
            style={{
              width: `${Math.min(100, Math.max(0, percent))}%`,
              backgroundColor: statusColor,
            }}
          />
        </div>
        <div className="achievement-node__progress-meta">
          <span>{progress.current} / {progress.total}</span>
          <span>{percent}%</span>
        </div>
      </div>
      <div className="achievement-node__footer">
        <span className="achievement-node__status" style={{ color: statusColor }}>
          {STATUS_LABELS[status] ?? 'Unknown'}
        </span>
        <span className="achievement-node__xp">{xp} XP</span>
      </div>
      <Handle type="source" position={Position.Right} className="achievement-node__handle" />
    </div>
  )
}
