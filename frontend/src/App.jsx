import React, { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import Home from './pages/Home'
import BoardView from './pages/BoardView'

export default function App() {
  const [activeBoardId, setActiveBoardId] = useState(null)

  return (
    <div className="min-h-screen w-full bg-slate-100">
      {activeBoardId ? (
        <ReactFlowProvider>
          <BoardView boardId={activeBoardId} onBack={() => setActiveBoardId(null)} />
        </ReactFlowProvider>
      ) : (
        <Home onOpen={setActiveBoardId} />
      )}
    </div>
  )
}