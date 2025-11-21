import React from 'react'

export default function Stats({ score, level, lines, isPaused, isGameOver }) {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
        <div className="text-xs text-blue-200">Score</div>
        <div className="text-2xl font-bold text-white">{score}</div>
      </div>
      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
        <div className="text-xs text-blue-200">Level</div>
        <div className="text-2xl font-bold text-white">{level}</div>
      </div>
      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60">
        <div className="text-xs text-blue-200">Lines</div>
        <div className="text-2xl font-bold text-white">{lines}</div>
      </div>
      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60 text-blue-200 text-sm">
        <p>Controls</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>← → Move</li>
          <li>↑ Rotate</li>
          <li>↓ Soft drop</li>
          <li>Space Hard drop</li>
          <li>P Pause/Resume</li>
          <li>R Restart</li>
        </ul>
      </div>
      {isPaused && !isGameOver && (
        <div className="p-3 bg-yellow-500/20 border border-yellow-400/40 rounded-lg text-yellow-200">Paused</div>
      )}
      {isGameOver && (
        <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-lg text-rose-200">Game Over</div>
      )}
    </div>
  )
}
