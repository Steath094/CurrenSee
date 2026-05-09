import { useState } from 'react'
import type { FormEvent } from 'react'
import heroImage from '../../assets/hero.png'
import { getApiErrorMessage } from '../../lib/api'
import type { RegisterPayload } from '../../lib/api'
import Icon from '../common/Icon'

type SignupPageProps = {
  onBackHome: () => void
  onSignup: (payload: RegisterPayload) => Promise<void>
  onShowLogin: () => void
}

function SignupPage({ onBackHome, onShowLogin, onSignup }: SignupPageProps) {
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    const payload = {
      email: String(formData.get('email') ?? '').trim(),
      name: String(formData.get('name') ?? '').trim(),
      password,
    }

    setErrorMessage(undefined)
    setIsSubmitting(true)

    try {
      await onSignup(payload)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page auth-page--signup">
      <section className="auth-visual" aria-label="MintAI platform preview">
        <img src={heroImage} alt="" />
        <div className="auth-visual__content">
          <button className="auth-brand auth-brand--visual" onClick={onBackHome} type="button">
            <Icon filled name="neurology" size="lg" />
            <span>MintAI</span>
          </button>
          <h1>
            Initialize Your
            <span>Neural Instance.</span>
          </h1>
          <p>
            Access high-precision analysis tools, model review, and
            enterprise-grade currency intelligence in one command architecture.
          </p>
        </div>
      </section>

      <section className="auth-panel" aria-label="Create MintAI account">
        <div className="auth-panel__inner">
          <button className="auth-brand auth-brand--mobile" onClick={onBackHome} type="button">
            <Icon filled name="neurology" size="lg" />
            <span>MintAI</span>
          </button>

          <div className="auth-card__header auth-card__header--left">
            <h1>Create Account</h1>
            <p>Join the MintAI platform to begin.</p>
          </div>

          <div className="social-login-row" aria-label="Social sign up options">
            <button className="social-login" type="button">
              <span className="social-login__google" aria-hidden="true">
                G
              </span>
              <span>Continue with Google</span>
            </button>
            <button className="social-login" type="button">
              <Icon filled name="code" size="sm" />
              <span>GitHub</span>
            </button>
          </div>

          <div className="auth-divider">
            <span />
            <p>or continue with email</p>
            <span />
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field" htmlFor="signup-name">
              <span>Full Name</span>
              <input
                autoComplete="name"
                className="auth-input"
                id="signup-name"
                name="name"
                placeholder="Jane Doe"
                required
                type="text"
              />
            </label>

            <label className="auth-field" htmlFor="signup-email">
              <span>Email Address</span>
              <input
                autoComplete="email"
                className="auth-input"
                id="signup-email"
                name="email"
                placeholder="jane@example.com"
                required
                type="email"
              />
            </label>

            <label className="auth-field" htmlFor="signup-password">
              <span>Password</span>
              <div className="auth-field__control auth-field__control--plain">
                <input
                  autoComplete="new-password"
                  id="signup-password"
                  name="password"
                  placeholder="Password"
                  required
                  type={isPasswordVisible ? 'text' : 'password'}
                />
                <button
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  type="button"
                >
                  <Icon name={isPasswordVisible ? 'visibility' : 'visibility_off'} size="sm" />
                </button>
              </div>
            </label>

            <label className="auth-field" htmlFor="signup-confirm-password">
              <span>Confirm Password</span>
              <input
                autoComplete="new-password"
                className="auth-input"
                id="signup-confirm-password"
                name="confirmPassword"
                placeholder="Password"
                required
                type={isPasswordVisible ? 'text' : 'password'}
              />
            </label>

            <label className="terms-row" htmlFor="signup-terms">
              <input id="signup-terms" required type="checkbox" />
              <span>
                I agree to the MintAI <a href="#terms">Terms of Service</a> and{' '}
                <a href="#privacy">Privacy Policy</a>.
              </span>
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
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
              <Icon filled name="arrow_forward" size="sm" />
            </button>
          </form>

          <p className="auth-card__switch">
            Already have an account?
            <button onClick={onShowLogin} type="button">
              Log in here
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default SignupPage
