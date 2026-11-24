import { useEffect, useState } from 'react'

const SESSION_KEY = 'anka-intro-fog-shown'

export default function IntroFog() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    sessionStorage.setItem(SESSION_KEY, 'true')
    setVisible(true)

    const timer = setTimeout(() => setVisible(false), 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="intro-fog" aria-hidden="true">
      <span className="intro-fog-cloud fog-one" />
      <span className="intro-fog-cloud fog-two" />
      <span className="intro-fog-cloud fog-three" />
      <span className="intro-fog-cloud fog-four" />
    </div>
  )
}