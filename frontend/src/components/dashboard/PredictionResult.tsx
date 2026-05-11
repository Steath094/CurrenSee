import { useState } from 'react'
import type { CurrencyPrediction } from '../../types/prediction'
import Button from '../common/Button'
import Icon from '../common/Icon'

type Feedback = 'positive' | 'negative' | null

const DENOMINATION_OPTIONS = [
  'Rs. 10',
  'Rs. 20',
  'Rs. 50',
  'Rs. 100',
  'Rs. 200',
  'Rs. 500',
  'Rs. 2000',
]

type PredictionResultProps = {
  errorMessage?: string
  feedback: Feedback
  isFeedbackSubmitting?: boolean
  onFeedback: (wasCorrect: boolean, correctedLabel?: string) => void
  result: CurrencyPrediction
}

function PredictionResult({
  errorMessage,
  feedback,
  isFeedbackSubmitting = false,
  onFeedback,
  result,
}: PredictionResultProps) {
  const confidence = Math.max(0, Math.min(100, result.confidence))
  const [correctedLabel, setCorrectedLabel] = useState('')
  const [isCorrecting, setIsCorrecting] = useState(false)

  const handleCorrect = () => {
    setIsCorrecting(false)
    setCorrectedLabel('')
    onFeedback(true)
  }

  const handleWrong = () => {
    setIsCorrecting(true)
  }

  return (
    <section className="result-card" aria-label="Prediction result">
      <div className="result-card__header">
        <div>
          <p className="eyebrow">Detected Denomination</p>
          <h2>{result.denomination}</h2>
          <p className="result-card__subtitle">
            {result.currency} ({result.series})
          </p>
        </div>

        <div className="confidence-badge">
          <strong>{confidence}%</strong>
          <span>Confidence</span>
        </div>
      </div>

      <div className="confidence-meter" aria-label={`${confidence}% confidence`}>
        <span style={{ width: `${confidence}%` }} />
      </div>

      <div className="feedback-row">
        <span>Was this prediction correct?</span>
        <div className="feedback-row__actions">
          <Button
            active={feedback === 'positive'}
            aria-label="Prediction is accurate"
            disabled={isFeedbackSubmitting}
            onClick={handleCorrect}
            size="small"
            variant="outline"
          >
            <Icon name="thumb_up" size="sm" />
            Correct
          </Button>
          <Button
            active={feedback === 'negative' || isCorrecting}
            aria-label="Prediction is not accurate"
            disabled={isFeedbackSubmitting}
            onClick={handleWrong}
            size="small"
            variant="outline"
          >
            <Icon name="thumb_down" size="sm" />
            Wrong
          </Button>
        </div>
      </div>

      {isCorrecting ? (
        <div className="feedback-correction">
          <select
            aria-label="Correct denomination"
            disabled={isFeedbackSubmitting}
            onChange={(event) => setCorrectedLabel(event.target.value)}
            value={correctedLabel}
          >
            <option value="">Select actual denomination</option>
            {DENOMINATION_OPTIONS.map((denomination) => (
              <option key={denomination} value={denomination}>
                {denomination}
              </option>
            ))}
          </select>
          <Button
            disabled={!correctedLabel || isFeedbackSubmitting}
            onClick={() => onFeedback(false, correctedLabel)}
            size="small"
            variant="primary"
          >
            Submit Feedback
          </Button>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="result-card__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  )
}

export default PredictionResult
