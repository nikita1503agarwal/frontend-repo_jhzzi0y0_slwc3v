import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Board from './components/Board'
import NextPiece from './components/NextPiece'
import Stats from './components/Stats'

// Game constants
const ROWS = 20
const COLS = 10

const SHAPES = {
  I: [
    ['I','I','I','I']
  ],
  J: [
    ['J',0,0],
    ['J','J','J']
  ],
  L: [
    [0,0,'L'],
    ['L','L','L']
  ],
  O: [
    ['O','O'],
    ['O','O']
  ],
  S: [
    [0,'S','S'],
    ['S','S',0]
  ],
  T: [
    [0,'T',0],
    ['T','T','T']
  ],
  Z: [
    ['Z','Z',0],
    [0,'Z','Z']
  ],
}

const TYPES = Object.keys(SHAPES)

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function rotateMatrix(matrix) {
  const rows = matrix.length
  const cols = matrix[0].length
  const res = Array.from({ length: cols }, () => Array(rows).fill(0))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      res[c][rows - 1 - r] = matrix[r][c]
    }
  }
  return res
}

function getRandomType() {
  return TYPES[Math.floor(Math.random() * TYPES.length)]
}

function createPiece(type) {
  const shape = SHAPES[type]
  return {
    type,
    shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: -shape.length, // start above the board for spawn animation/fit
  }
}

function canPlace(board, piece, offX = 0, offY = 0, rotShape = null) {
  const shape = rotShape || piece.shape
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const newX = piece.x + c + offX
      const newY = piece.y + r + offY
      if (newX < 0 || newX >= COLS || newY >= ROWS) return false
      if (newY >= 0 && board[newY][newX] !== 0) return false
    }
  }
  return true
}

function mergeBoard(board, piece) {
  const res = board.map(row => row.slice())
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      const val = piece.shape[r][c]
      if (!val) continue
      const y = piece.y + r
      const x = piece.x + c
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        res[y][x] = val
      }
    }
  }
  return res
}

function clearLines(board) {
  let cleared = 0
  const newBoard = []
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every(v => v !== 0)) {
      cleared++
    } else {
      newBoard.push(board[r])
    }
  }
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array(COLS).fill(0))
  }
  return { board: newBoard, cleared }
}

function scoreForLines(lines) {
  switch (lines) {
    case 1: return 100
    case 2: return 300
    case 3: return 500
    case 4: return 800
    default: return 0
  }
}

function useInterval(callback, delay, enabled) {
  const savedCallback = useRef()
  useEffect(() => { savedCallback.current = callback }, [callback])
  useEffect(() => {
    if (!enabled || delay == null) return
    const id = setInterval(() => savedCallback.current && savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay, enabled])
}

export default function App() {
  const [board, setBoard] = useState(() => createBoard())
  const [current, setCurrent] = useState(() => createPiece(getRandomType()))
  const [nextType, setNextType] = useState(() => getRandomType())
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const nextMatrix = useMemo(() => SHAPES[nextType], [nextType])

  const speed = useMemo(() => {
    // faster with level, min 120ms
    const base = 800
    const decay = Math.max(120, base - (level - 1) * 70)
    return decay
  }, [level])

  const startGame = () => {
    setBoard(createBoard())
    const first = createPiece(getRandomType())
    setCurrent(first)
    setNextType(getRandomType())
    setScore(0)
    setLevel(1)
    setLines(0)
    setRunning(true)
    setPaused(false)
    setGameOver(false)
  }

  const tryMove = useCallback((dx, dy) => {
    if (!running || paused || gameOver) return
    if (canPlace(board, current, dx, dy)) {
      setCurrent(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
    } else if (dy === 1) {
      // lock piece
      const merged = mergeBoard(board, current)
      const { board: clearedBoard, cleared } = clearLines(merged)
      if (cleared > 0) {
        setLines(l => l + cleared)
        setScore(s => s + scoreForLines(cleared) * level)
        setLevel(lv => 1 + Math.floor((lines + cleared) / 10))
      }
      // spawn next
      const spawn = createPiece(nextType)
      const nextNext = getRandomType()
      setNextType(nextNext)
      if (!canPlace(clearedBoard, spawn)) {
        setGameOver(true)
        setRunning(false)
        setPaused(false)
      } else {
        setBoard(clearedBoard)
        setCurrent(spawn)
      }
    }
  }, [board, current, running, paused, gameOver, nextType, level, lines])

  const hardDrop = useCallback(() => {
    if (!running || paused || gameOver) return
    let dy = 0
    while (canPlace(board, current, 0, dy + 1)) dy++
    if (dy > 0) {
      setCurrent(prev => ({ ...prev, y: prev.y + dy }))
    }
    // then lock immediately
    const merged = mergeBoard(board, { ...current, y: current.y + dy })
    const { board: clearedBoard, cleared } = clearLines(merged)
    if (cleared > 0) {
      setLines(l => l + cleared)
      setScore(s => s + scoreForLines(cleared) * level)
      setLevel(lv => 1 + Math.floor((lines + cleared) / 10))
    }
    const spawn = createPiece(nextType)
    const nextNext = getRandomType()
    setNextType(nextNext)
    if (!canPlace(clearedBoard, spawn)) {
      setGameOver(true)
      setRunning(false)
      setPaused(false)
    } else {
      setBoard(clearedBoard)
      setCurrent(spawn)
    }
  }, [board, current, running, paused, gameOver, nextType, level, lines])

  const rotate = useCallback(() => {
    if (!running || paused || gameOver) return
    const rotated = rotateMatrix(current.shape)
    if (canPlace(board, current, 0, 0, rotated)) {
      setCurrent(prev => ({ ...prev, shape: rotated }))
      return
    }
    // wall kicks: try small horizontal adjustments
    if (canPlace(board, current, -1, 0, rotated)) {
      setCurrent(prev => ({ ...prev, x: prev.x - 1, shape: rotated }))
    } else if (canPlace(board, current, 1, 0, rotated)) {
      setCurrent(prev => ({ ...prev, x: prev.x + 1, shape: rotated }))
    }
  }, [board, current, running, paused, gameOver])

  // Gravity
  useInterval(() => tryMove(0, 1), speed, running && !paused && !gameOver)

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'ArrowLeft') { e.preventDefault(); tryMove(-1, 0) }
      else if (e.code === 'ArrowRight') { e.preventDefault(); tryMove(1, 0) }
      else if (e.code === 'ArrowDown') { e.preventDefault(); tryMove(0, 1) }
      else if (e.code === 'ArrowUp') { e.preventDefault(); rotate() }
      else if (e.code === 'Space') { e.preventDefault(); hardDrop() }
      else if (e.key.toLowerCase() === 'p') { e.preventDefault(); if (running && !gameOver) setPaused(p => !p) }
      else if (e.key.toLowerCase() === 'r') { e.preventDefault(); startGame() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [tryMove, rotate, hardDrop, running, gameOver])

  const displayBoard = useMemo(() => mergeBoard(board, current), [board, current])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.08),transparent_40%)]" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Tetris</h1>
          <div className="flex gap-2">
            {!running || gameOver ? (
              <button onClick={startGame} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow">
                {gameOver ? 'Play Again' : 'Start'}
              </button>
            ) : (
              <button onClick={() => setPaused(p => !p)} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold shadow">
                {paused ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[auto_240px] gap-6 items-start">
          <div className="mx-auto">
            <Board board={displayBoard} />
          </div>
          <div className="space-y-4">
            <Stats score={score} level={level} lines={lines} isPaused={paused} isGameOver={gameOver} />
            <NextPiece matrix={nextMatrix} />
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/60 text-blue-200 text-sm">
              <p className="mb-1">Tips</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Clear multiple lines at once for combo points.</li>
                <li>Level increases every 10 lines and speeds up.</li>
              </ul>
            </div>
          </div>
        </div>

        {(!running || paused || gameOver) && (
          <div className="pointer-events-none">
            {(paused && !gameOver) && (
              <div className="fixed inset-0 flex items-center justify-center">
                <div className="pointer-events-auto px-6 py-3 rounded-lg bg-yellow-500/20 border border-yellow-400/40 text-yellow-200">Paused (press P to resume)</div>
              </div>
            )}
            {(!running && !gameOver) && (
              <div className="fixed inset-0 flex items-center justify-center">
                <div className="pointer-events-auto px-6 py-4 rounded-xl bg-slate-900/80 border border-slate-700 text-blue-100 text-center">
                  <p className="text-lg font-semibold mb-2">Ready to play?</p>
                  <p className="text-sm opacity-80">Press Start or hit R to begin</p>
                </div>
              </div>
            )}
            {gameOver && (
              <div className="fixed inset-0 flex items-center justify-center">
                <div className="pointer-events-auto px-6 py-4 rounded-xl bg-rose-900/70 border border-rose-700 text-rose-100 text-center">
                  <p className="text-lg font-semibold mb-2">Game Over</p>
                  <p className="text-sm opacity-80">Score: {score} • Lines: {lines}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
