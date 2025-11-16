import React, { useEffect, useState } from 'react'

import { listBoards, createBoard as apiCreateBoard } from '../api/boards'

export default function Home({ onOpen }) {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const json = await listBoards()
        setBoards(Array.isArray(json) ? json : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function createBoard() {
    if (!name.trim()) return
    try {
      const created = await apiCreateBoard({ name: name.trim(), nodes: [], edges: [], layout: {} })
      if (created) {
        setBoards((s) => [created, ...s])
        setName('')
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return <div className="px-6 py-12 text-slate-600">Loading boards...</div>
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-slate-900">Your boards</h1>
        <p className="text-sm text-slate-500">
          Create a board to start mapping your goals, or open one you have already saved.
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/60">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Board name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Flow strategy"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </label>
        <button type="button" onClick={createBoard} className="self-start" disabled={!name.trim()}>
          Create board
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/50">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent boards</h2>
        {boards.length === 0 ? (
          <p className="text-sm text-slate-500">No boards yet. Create the first one above.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {boards.map((board) => (
              <li
                key={board._id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-base font-medium text-slate-900">{board.name}</p>
                  {board.updatedAt && (
                    <p className="text-xs text-slate-500">
                      Updated {new Date(board.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => onOpen(board._id)}>
                  Open
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}