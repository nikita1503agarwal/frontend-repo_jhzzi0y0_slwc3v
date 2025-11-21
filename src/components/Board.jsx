import React from 'react'

const Cell = ({ value }) => {
  const colors = {
    0: 'bg-slate-800/40 border-slate-700/60',
    I: 'bg-cyan-400 border-cyan-300',
    J: 'bg-blue-500 border-blue-400',
    L: 'bg-orange-400 border-orange-300',
    O: 'bg-yellow-400 border-yellow-300',
    S: 'bg-emerald-400 border-emerald-300',
    T: 'bg-purple-400 border-purple-300',
    Z: 'bg-rose-400 border-rose-300',
  }
  const cls = colors[value] || colors[0]
  return (
    <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border ${cls} rounded-[4px] shadow-inner`} />
  )
}

export default function Board({ board }) {
  return (
    <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-700/60 shadow-xl">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${board[0].length}, minmax(0, 1fr))` }}
      >
        {board.flatMap((row, rIdx) =>
          row.map((cell, cIdx) => <Cell key={`${rIdx}-${cIdx}`} value={cell} />)
        )}
      </div>
    </div>
  )
}
