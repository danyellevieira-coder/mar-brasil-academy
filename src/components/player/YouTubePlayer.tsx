'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// Minimal type definition to satisfy the compiler without @types/youtube
declare namespace YT {
  interface Player {
    playVideo(): void
    pauseVideo(): void
    getPlayerState(): number
    getCurrentTime(): number
    getDuration(): number
    destroy(): void
  }
  interface PlayerEvent {
    target: Player
  }
  interface OnStateChangeEvent {
    data: number
    target: Player
  }
}

interface YouTubePlayerProps {
  videoId: string
  onVideoEnd: () => void
  onProgress?: (percent: number) => void
}

export default function YouTubePlayer({ videoId, onVideoEnd, onProgress }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null)
  
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange) // Safari/older Chrome
    document.addEventListener('mozfullscreenchange', handleFullscreenChange) // Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange) // IE/Edge

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScript = document.getElementsByTagName('script')[0]
      firstScript.parentNode?.insertBefore(tag, firstScript)
    }

    const initPlayer = () => {
      // Use a child div for the player so wrapperRef stays valid
      if (containerRef.current && window.YT && window.YT.Player) {
        // Clear container first to prevent duplicate iframes
        containerRef.current.innerHTML = ''
        const playerDiv = document.createElement('div')
        containerRef.current.appendChild(playerDiv)

        const player = new window.YT.Player(playerDiv, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,        // Hide default controls
            disablekb: 1,       // Disable keyboard
            fs: 0,              // Disable native fullscreen button (we use custom)
            modestbranding: 1,  // Minimal YouTube branding
            rel: 0,             // Don't show related videos
            showinfo: 0,        // Hide video info
            iv_load_policy: 3,  // Hide annotations
            playsinline: 1,     // Play inline on mobile
          },
          events: {
            onReady: (event: YT.PlayerEvent) => {
              playerRef.current = event.target
              setDuration(event.target.getDuration())
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)
                startProgressTracking()
                resetControlsTimeout()
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false)
                stopProgressTracking()
                setShowControls(true) 
                if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
              } else if (event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false)
                stopProgressTracking()
                onVideoEnd()
                setShowControls(true)
              }
            }
          }
        })
      }
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      stopProgressTracking()
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
      }
    }
  }, [videoId, onVideoEnd])

  const startProgressTracking = () => {
    if (progressInterval.current) return
    progressInterval.current = setInterval(() => {
      // Check if playerRef.current is valid and has getCurrentTime
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const currentTime = playerRef.current.getCurrentTime()
        const videoDuration = playerRef.current.getDuration()
        const percent = (currentTime / videoDuration) * 100
        setProgress(percent)
        onProgress?.(percent)
      }
    }, 500)
  }

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
      progressInterval.current = null
    }
  }

  const resetControlsTimeout = () => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    setShowControls(true)
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const togglePlay = () => {
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return
    
    // Safely check player state
    const playerState = typeof playerRef.current.getPlayerState === 'function' 
      ? playerRef.current.getPlayerState() 
      : -1
      
    if (playerState === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleCreateInteraction = () => {
    resetControlsTimeout()
  }

  const toggleControls = () => {
    if (showControls && isPlaying) {
      setShowControls(false)
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    } else {
      resetControlsTimeout()
    }
  }

  const handleFullscreen = () => {
    if (wrapperRef.current) {
      const element = wrapperRef.current
      const requestFullScreen = element.requestFullscreen || 
                               (element as any).webkitRequestFullscreen || 
                               (element as any).msRequestFullscreen
      
      if (document.fullscreenElement) {
         if (document.exitFullscreen) document.exitFullscreen()
      } else if (requestFullScreen) {
        requestFullScreen.call(element)
      } else {
        // iOS Fallback or browsers that don't support div fullscreen
        // Not ideal but better than nothing: we could try utilizing a full-viewport fixed css class
        // For now, we assume standard API or webkit is available (Android Chrome supports it)
      }
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = duration * (progress / 100)

  return (
    <div 
      ref={wrapperRef} 
      className={`relative aspect-video bg-black overflow-hidden group ${isFullscreen ? 'h-screen w-screen' : ''}`}
      onMouseMove={handleCreateInteraction}
      onTouchStart={resetControlsTimeout}
    >
      {/* YouTube Player Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
      
      {/* Overlay to catch clicks and manage controls */}
      <div 
        className="absolute inset-0 z-10"
        onClick={toggleControls}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Custom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 flex flex-col justify-end ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div className="relative h-1 bg-white/20 rounded-full mb-4 cursor-pointer w-full group/progress" onClick={(e) => e.stopPropagation()}>
          <div 
            className="absolute h-full bg-[var(--accent)] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Seek Handle (Visual only for now) */}
           <div 
            className="absolute h-3 w-3 bg-white rounded-full top-1/2 -translate-y-1/2 shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm"
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Time Display */}
            <span className="text-white text-xs md:text-sm font-medium tabular-nums drop-shadow-md">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Restriction Notice - Mobile Friendly */}
            <div className={`hidden sm:flex items-center gap-2 text-white/70 text-xs bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm transition-opacity ${isFullscreen ? 'hidden' : 'flex'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Controles restritos</span>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm hover:scale-105 active:scale-95"
              title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
            >
              {isFullscreen ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Center Play Button (when paused or controls visible) */}
      {(showControls || !isPlaying) && (
        <div 
          className={`absolute inset-0 z-15 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <button 
             onClick={togglePlay}
             className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-[var(--accent)] hover:scale-110 active:scale-95 transition-all transform rounded-full shadow-lg pointer-events-auto cursor-pointer border-2 border-white/20 backdrop-blur-sm"
          >
            {isPlaying ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
