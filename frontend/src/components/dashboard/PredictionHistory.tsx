import { useEffect, useState } from 'react'
import { getApiErrorMessage, getPredictionHistory } from '../../lib/api'
import type {
  PredictionHistoryResponse,
  PredictionRecord,
} from '../../types/prediction'
import Icon from '../common/Icon'

function formatConfidence(confidence: number) {
  const normalized = confidence <= 1 ? confidence * 100 : confidence

  return Math.round(Math.max(0, Math.min(100, normalized)))
}

function getCurrencyLabel(denomination: string) {
  if (denomination.startsWith('$')) {
    return 'USD'
  }

  if (denomination.toLowerCase().startsWith('rs')) {
    return 'INR'
  }

  if (denomination.toUpperCase().startsWith('EUR')) {
    return 'EUR'
  }

  return 'INR'
}

function formatTimestamp(value?: string) {
  if (!value) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function PredictionHistory() {
  const [data, setData] = useState<PredictionHistoryResponse>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isActive = true

    const loadPredictions = async () => {
      setIsLoading(true)
      setErrorMessage(undefined)

      try {
        const response = await getPredictionHistory()

        if (isActive) {
          setData(response)
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(getApiErrorMessage(error))
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadPredictions()

    return () => {
      isActive = false
    }
  }, [])

  const predictions = data?.predictions ?? []

  return (
    <main className="history-main">
      <div className="history-container">
        <section className="history-header">
          <div>
            <h1>Prediction History</h1>
            <p>Review recent CurrenSee predictions and feedback status.</p>
          </div>

          {/* Future feature - temporarily hidden until history filters are wired. */}
          {/* <div className="history-filter-row">
            <div className="history-filter">
              <Icon name="calendar_today" size="sm" />
              <span>All dates</span>
            </div>
            <div className="history-filter">
              <Icon name="filter_list" size="sm" />
              <span>Model: All</span>
            </div>
          </div> */}
        </section>

        <section className="history-table-card" aria-label="Prediction history table">
          {isLoading ? <p className="history-state">Loading predictions...</p> : null}
          {errorMessage ? (
            <p className="history-state history-state--error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {!isLoading && !errorMessage && predictions.length === 0 ? (
            <p className="history-state">
              No prediction history yet. Run an analysis from the Scan view.
            </p>
          ) : null}

          {predictions.length > 0 ? (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Currency</th>
                    <th>Denomination</th>
                    <th>Confidence</th>
                    <th>AI Model</th>
                    <th>Timestamp</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((prediction) => (
                    <HistoryRow
                      key={
                        prediction.predictionId ??
                        prediction._id ??
                        `${prediction.denomination}-${prediction.createdAt}`
                      }
                      prediction={prediction}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section className="history-pagination" aria-label="Prediction count">
          <p>Showing latest {predictions.length} predictions</p>
        </section>
      </div>
    </main>
  )
}

function HistoryRow({ prediction }: { prediction: PredictionRecord }) {
  const confidence = formatConfidence(prediction.confidence)
  const isLowConfidence = confidence < 80

  return (
    <tr>
      <td>
        <div className="history-currency-cell">
          <div className="history-currency-thumb">
            {prediction.imageUrl ? (
              <img alt={`${prediction.denomination} upload`} src={prediction.imageUrl} />
            ) : (
              <Icon name="receipt_long" size="sm" />
            )}
          </div>
          <strong>{getCurrencyLabel(prediction.denomination)}</strong>
        </div>
      </td>
      <td className="history-denomination">{prediction.denomination}</td>
      <td>
        <div className="history-confidence">
          <span className={isLowConfidence ? 'is-low' : ''}>{confidence}%</span>
          <div>
            <span
              className={isLowConfidence ? 'is-low' : ''}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </td>
      <td>
        <span className="history-model-badge">{prediction.modelVersion}</span>
      </td>
      <td className="history-muted">{formatTimestamp(prediction.createdAt)}</td>
      <td className="history-feedback">
        {prediction.isCorrect === true ? 'Correct' : null}
        {prediction.isCorrect === false ? 'Incorrect' : null}
        {prediction.isCorrect == null ? 'Not marked' : null}
      </td>
    </tr>
  )
}

export default PredictionHistory
