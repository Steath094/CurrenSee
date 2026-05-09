import heroImage from '../../assets/hero.png'
import Icon from '../common/Icon'

type LandingPageProps = {
  onLogin: () => void
  onSignup: () => void
}

const features = [
  {
    body: 'Microscopic anomaly detection tuned for global fiat patterns and printed security markers.',
    icon: 'memory',
    tone: 'primary',
    title: 'Neural Accuracy',
  },
  {
    body: 'Analyze high-resolution currency scans quickly through the same dashboard used by operators.',
    icon: 'bolt',
    tone: 'secondary',
    title: 'Real-Time Processing',
  },
  {
    body: 'Flag suspicious injection vectors before they enter your verification workflow.',
    icon: 'shield_lock',
    tone: 'tertiary',
    title: 'Fraud Protection',
  },
]

const pipelineSteps = [
  {
    body: 'Securely ingest clear currency photos through the dashboard.',
    title: 'Upload',
  },
  {
    body: 'Run the neural model against denomination and authenticity signals.',
    title: 'Analyze',
  },
  {
    body: 'Review confidence, prediction details, and feedback controls instantly.',
    title: 'Verify',
  },
]

const plans = [
  {
    cta: 'Select Plan',
    features: ['100 scans per month', 'Standard accuracy', 'Dashboard access'],
    name: 'Free',
    price: '$0',
  },
  {
    cta: 'Start Pro',
    featured: true,
    features: ['10,000 scans per month', 'Neural accuracy', 'API-ready workflow'],
    name: 'Pro',
    price: '$99',
  },
  {
    cta: 'Contact Sales',
    features: ['Unlimited scans', 'Dedicated node', 'SLA guarantee'],
    name: 'Enterprise',
    price: 'Custom',
  },
]

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  return (
    <div className="public-page landing-page">
      <header className="public-nav">
        <button
          aria-label="MintAI home"
          className="public-brand"
          onClick={() => scrollToSection('landing-hero')}
          type="button"
        >
          <Icon filled name="neurology" size="lg" />
          <span>MintAI</span>
        </button>

        <nav className="public-nav__links" aria-label="Landing navigation">
          <button onClick={() => scrollToSection('features')} type="button">
            Features
          </button>
          <button onClick={() => scrollToSection('technology')} type="button">
            Technology
          </button>
          <button onClick={() => scrollToSection('pricing')} type="button">
            Pricing
          </button>
          <button onClick={() => scrollToSection('history')} type="button">
            History
          </button>
        </nav>

        <div className="public-nav__actions">
          <button className="public-link-button" onClick={onLogin} type="button">
            Login
          </button>
          <button className="public-primary-button" onClick={onSignup} type="button">
            Analyze Currency
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero" id="landing-hero">
          <div className="landing-hero__backdrop" aria-hidden="true">
            <img src={heroImage} alt="" />
          </div>

          <div className="landing-hero__content">
            <p className="public-eyebrow">High-precision neural analysis</p>
            <h1>MintAI Currency Intelligence</h1>
            <p>
              Master denomination detection, authenticity signals, and asset
              verification from one focused analysis dashboard.
            </p>
            <div className="landing-hero__actions">
              <button className="public-primary-button public-primary-button--large" onClick={onSignup} type="button">
                Start Analyzing
              </button>
              <button
                className="public-secondary-button public-secondary-button--large"
                onClick={() => scrollToSection('technology')}
                type="button"
              >
                View Technology
              </button>
            </div>
          </div>
        </section>

        <section className="public-section public-section--tight" id="features">
          <div className="public-section__header">
            <p className="public-eyebrow">Unmatched precision</p>
            <h2>Built for trusted currency workflows</h2>
            <p>
              A calm, operator-ready layer for scans, predictions, and review.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="public-card feature-card" key={feature.title}>
                <Icon
                  className={`feature-card__icon feature-card__icon--${feature.tone}`}
                  name={feature.icon}
                  size="xl"
                />
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="public-band" id="technology">
          <div className="public-section__header">
            <p className="public-eyebrow">Analysis pipeline</p>
            <h2>From upload to verification in three steps</h2>
          </div>

          <div className="pipeline-grid">
            {pipelineSteps.map((step, index) => (
              <article className="pipeline-step" key={step.title}>
                <div className="pipeline-step__index">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="public-section" id="pricing">
          <div className="public-section__header">
            <p className="public-eyebrow">Scalable intelligence</p>
            <h2>Choose the right analysis volume</h2>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <article
                className={`public-card pricing-card ${plan.featured ? 'pricing-card--featured' : ''}`}
                key={plan.name}
              >
                {plan.featured ? <span className="pricing-card__badge">Popular</span> : null}
                <h3>{plan.name}</h3>
                <div className="pricing-card__price">
                  {plan.price}
                  {plan.price.startsWith('$') ? <span>/mo</span> : null}
                </div>
                <ul>
                  {plan.features.map((item) => (
                    <li key={item}>
                      <Icon name="check" size="sm" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={plan.featured ? 'public-primary-button' : 'public-secondary-button'}
                  onClick={onSignup}
                  type="button"
                >
                  {plan.cta}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="public-band public-band--cta" id="history">
          <div>
            <p className="public-eyebrow">Ready when you are</p>
            <h2>Secure your currency analysis workflow.</h2>
          </div>
          <button className="public-primary-button public-primary-button--large" onClick={onSignup} type="button">
            Unlock Premium Insights
          </button>
        </section>
      </main>

      <footer className="public-footer">
        <div className="public-brand public-brand--static">
          <Icon filled name="neurology" size="md" />
          <span>MintAI</span>
        </div>
        <p>(c) 2026 MintAI Technologies. High-precision neural analysis.</p>
        <nav aria-label="Legal links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#api">API Documentation</a>
          <a href="#compliance">Compliance</a>
        </nav>
      </footer>
    </div>
  )
}

export default LandingPage
