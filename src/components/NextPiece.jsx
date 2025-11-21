import React from 'react'

const MiniCell = ({ value }) => {
  const colors = {
    0: 'bg-slate-800/50 border-slate-700/70',
    I: 'bg-cyan-400 border-cyan-300',
    J: 'bg-blue-500 border-blue-400',
    L: 'bg-orange-400 border-orange-300',
    O: 'bg-yellow-400 border-yellow-300',
    S: 'bg-emerald-400 border-emerald-300',
    T: 'bg-purple-400 border-purple-300',
    Z: 'bg-rose-400 border-rose-300',
  }
  const cls = colors[value] || colors[0]
  return <div className={`w-5 h-5 border ${cls} rounded`}></div>
}

export default function NextPiece({ matrix }) {
  if (!matrix) return null
  const cols = Math.max(...matrix.map(r => r.length))
  return (
    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
      <div className="text-xs text-blue-200 mb-2">Next</div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {matrix.flatMap((row, r) => row.map((v, c) => <MiniCell key={`${r}-${c}`} value={v} />))}
      </div>
    </div>
  )
}
