import { useState } from 'react'
import type { FormEvent } from 'react'
import { getApiErrorMessage } from '../../lib/api'
import type { AuthPayload } from '../../lib/api'
import Icon from '../common/Icon'

type LoginPageProps = {
  onBackHome: () => void
  onLogin: (payload: AuthPayload) => Promise<void>
  onShowSignup: () => void
}

function LoginPage({ onBackHome, onLogin, onShowSignup }: LoginPageProps) {
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('password') ?? ''),
    }

    setErrorMessage(undefined)
    setIsSubmitting(true)

    try {
      await onLogin(payload)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page auth-page--login">
      <div className="auth-page__glow" aria-hidden="true" />

      <section className="auth-card auth-card--compact" aria-label="CurrenSee login">
        <button className="auth-brand" onClick={onBackHome} type="button">
          <Icon filled name="neurology" size="lg" />
          <span>CurrenSee</span>
        </button>

        <div className="auth-card__header">
          <h1>Secure Neural Access</h1>
          <p>Sign in to continue currency analysis.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field" htmlFor="login-email">
            <span>Email Address</span>
            <div className="auth-field__control">
              <Icon name="mail" size="sm" />
              <input
                autoComplete="email"
                id="login-email"
                name="email"
                placeholder="name@example.com"
                required
                type="email"
              />
            </div>
          </label>

          <label className="auth-field" htmlFor="login-password">
            <span className="auth-field__label-row">
              <span>Password</span>
              {/* Future feature - temporarily hidden until password reset is wired. */}
              {/* <a href="#forgot-password">Forgot Password?</a> */}
            </span>
            <div className="auth-field__control">
              <Icon name="lock" size="sm" />
              <input
                autoComplete="current-password"
                id="login-password"
                name="password"
                placeholder="Password"
                required
                type="password"
              />
            </div>
          </label>

          {errorMessage ? (
            <p className="auth-error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            className="public-primary-button auth-submit"
            disabled={isSubmitting}
            type="submit"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            <Icon filled name="arrow_forward" size="sm" />
          </button>
        </form>

        <p className="auth-card__switch">
          Do not have an account?
          <button onClick={onShowSignup} type="button">
            Sign Up
          </button>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
