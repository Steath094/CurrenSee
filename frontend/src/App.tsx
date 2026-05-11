import { useEffect, useState } from 'react'
import Dashboard from './components/dashboard/Dashboard'
import LandingPage from './components/public/LandingPage'
import LoginPage from './components/public/LoginPage'
import SignupPage from './components/public/SignupPage'
import {
  clearAuthUserName,
  clearAuthToken,
  getAuthToken,
  loginUser,
  logoutUser,
  registerUser,
  saveAuthUserName,
  saveAuthToken,
} from './lib/api'
import type { AuthPayload, RegisterPayload } from './lib/api'

type PublicView = 'landing' | 'login' | 'signup'

function getPublicViewFromHash(): PublicView {
  const hash = window.location.hash.replace('#', '')

  if (hash === 'login' || hash === 'signup') {
    return hash
  }

  return 'landing'
}

function App() {
  const [authToken, setAuthToken] = useState(() => getAuthToken())
  const [publicView, setPublicView] = useState<PublicView>(() =>
    getPublicViewFromHash(),
  )

  useEffect(() => {
    const handleHashChange = () => setPublicView(getPublicViewFromHash())

    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const clearHash = () => {
    window.history.replaceState(
      null,
      document.title,
      `${window.location.pathname}${window.location.search}`,
    )
  }

  const showPublicView = (view: PublicView) => {
    setPublicView(view)

    if (view === 'landing') {
      clearHash()
      return
    }

    window.location.hash = view
  }

  const handleAuthToken = (token: string, name: string) => {
    saveAuthToken(token)
    saveAuthUserName(name)
    setAuthToken(token)
    clearHash()
  }

  const handleLogin = async (payload: AuthPayload) => {
    const response = await loginUser(payload)
    handleAuthToken(response.token, response.user.name)
  }

  const handleSignup = async (payload: RegisterPayload) => {
    const response = await registerUser(payload)
    handleAuthToken(response.token, response.user.name)
  }

  const handleSignOut = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.warn('Logout API failed; clearing local session.', error)
    } finally {
      clearAuthUserName()
      clearAuthToken()
      setAuthToken(null)
      showPublicView('landing')
    }
  }

  if (authToken) {
    return <Dashboard onSignOut={handleSignOut} />
  }

  if (publicView === 'login') {
    return (
      <LoginPage
        onBackHome={() => showPublicView('landing')}
        onLogin={handleLogin}
        onShowSignup={() => showPublicView('signup')}
      />
    )
  }

  if (publicView === 'signup') {
    return (
      <SignupPage
        onBackHome={() => showPublicView('landing')}
        onShowLogin={() => showPublicView('login')}
        onSignup={handleSignup}
      />
    )
  }

  return (
    <LandingPage
      onLogin={() => showPublicView('login')}
      onSignup={() => showPublicView('signup')}
    />
  )
}

export default App
