import { useEffect, useState } from 'react'
import { getApiErrorMessage, getPredictions } from '../../lib/api'
import type {
  PredictionHistoryResponse,
  PredictionRecord,
} from '../../types/prediction'
import Button from '../common/Button'
import Icon from '../common/Icon'

const PAGE_SIZE = 10

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

function getShowingRange(data?: PredictionHistoryResponse) {
  if (!data || data.pagination.total === 0) {
    return 'Showing 0 results'
  }

  const start = (data.pagination.page - 1) * data.pagination.limit + 1
  const end = Math.min(
    data.pagination.page * data.pagination.limit,
    data.pagination.total,
  )

  return `Showing ${start}-${end} of ${data.pagination.total} results`
}

function PredictionHistory() {
  const [data, setData] = useState<PredictionHistoryResponse>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let isActive = true

    const loadPredictions = async () => {
      setIsLoading(true)
      setErrorMessage(undefined)

      try {
        const response = await getPredictions(page, PAGE_SIZE)

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
  }, [page])

  const predictions = data?.predictions ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  return (
    <main className="history-main">
      <div className="history-container">
        <section className="history-header">
          <div>
            <h1>Prediction History</h1>
            <p>Access and manage historical currency intelligence scans.</p>
          </div>

          <div className="history-filter-row">
            <div className="history-filter">
              <Icon name="calendar_today" size="sm" />
              <span>All dates</span>
            </div>
            <div className="history-filter">
              <Icon name="filter_list" size="sm" />
              <span>Model: All</span>
            </div>
          </div>
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
                    <HistoryRow key={prediction._id} prediction={prediction} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section className="history-pagination" aria-label="Prediction pagination">
          <p>{getShowingRange(data)}</p>
          <div className="history-pagination__actions">
            <Button
              aria-label="Previous page"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              variant="icon"
            >
              <Icon name="chevron_left" size="sm" />
            </Button>
            <span>
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <Button
              aria-label="Next page"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((currentPage) => currentPage + 1)}
              variant="icon"
            >
              <Icon name="chevron_right" size="sm" />
            </Button>
          </div>
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
            <Icon name="receipt_long" size="sm" />
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
