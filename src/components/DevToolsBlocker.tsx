'use client'

import { useEffect } from 'react'

export function DevToolsBlocker() {
  useEffect(() => {
    // Disable right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
      }

      // Ctrl+Shift+I (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault()
      }

      // Ctrl+Shift+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
        e.preventDefault()
      }

      // Ctrl+Shift+C (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
      }

      // Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault()
      }
    }

    // Clear console warning
    const clearConsole = () => {
      console.clear()
      console.log(
        '%cPare!',
        'color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0px black;'
      )
      console.log(
        '%cEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou "hackear" a conta de alguém, isso é uma fraude e você dará acesso à sua conta Mar Brasil Academy.',
        'font-size: 18px; color: white; background: #222; padding: 10px; border-radius: 5px;'
      )
      console.log(
        '%c❤️ Te amo Dany ❤️',
        'font-size: 14px; color: #ff69b4; font-weight: bold; margin-top: 10px; font-style: italic;'
      )
    }

    // Initial clear
    setTimeout(clearConsole, 1000)

    // Add listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    
    // Optional: aggressively clear console (can be annoying for legit debugging, so maybe just once or on focus)
    window.addEventListener('focus', clearConsole)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('focus', clearConsole)
    }
  }, [])

  return null
}
