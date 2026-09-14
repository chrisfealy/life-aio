import { useEffect, useState } from 'react'

const PRESETS = [60, 90, 120, 180]

export function RestTimer() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const running = secondsLeft !== null && secondsLeft > 0

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null || s <= 1) {
          clearInterval(interval)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [running])

  function start(seconds: number) {
    setSecondsLeft(seconds)
  }

  const mm = secondsLeft !== null ? Math.floor(secondsLeft / 60) : 0
  const ss = secondsLeft !== null ? secondsLeft % 60 : 0

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <span className="text-xs font-medium text-slate-500">Rest:</span>
      {running ? (
        <span className="tabular-nums text-sm font-semibold text-slate-900">
          {mm}:{ss.toString().padStart(2, '0')}
        </span>
      ) : (
        PRESETS.map((s) => (
          <button
            key={s}
            onClick={() => start(s)}
            className="rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
          >
            {s}s
          </button>
        ))
      )}
      {secondsLeft !== null && (
        <button onClick={() => setSecondsLeft(null)} className="text-xs text-slate-400 hover:text-slate-700">
          reset
        </button>
      )}
    </div>
  )
}
