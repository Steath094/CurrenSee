import type { PredictionRecord } from '../../types/prediction'
import Button from '../common/Button'
import Icon from '../common/Icon'

type RecentActivityProps = {
  errorMessage?: string
  isLoading: boolean
  onViewAll: () => void
  predictions: PredictionRecord[]
}

function formatConfidence(confidence: number) {
  const normalized = confidence <= 1 ? confidence * 100 : confidence

  return `${Math.round(Math.max(0, Math.min(100, normalized)))}%`
}

function getConfidenceStatus(confidence: number) {
  const normalized = confidence <= 1 ? confidence * 100 : confidence

  return normalized >= 80 ? 'high' : 'low'
}

function formatTime(value?: string) {
  if (!value) {
    return 'Just now'
  }

  const timestamp = new Date(value).getTime()

  if (!Number.isFinite(timestamp)) {
    return 'Just now'
  }

  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) {
    return 'Just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours} hr ago`
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}

function RecentActivity({
  errorMessage,
  isLoading,
  onViewAll,
  predictions,
}: RecentActivityProps) {
  return (
    <aside className="activity-panel" aria-label="Recent activity">
      <div className="activity-panel__header">
        <h3>Recent Activity</h3>
        <Button onClick={onViewAll} size="small" variant="ghost">
          View All
        </Button>
      </div>

      {isLoading ? <p className="activity-state">Loading activity...</p> : null}

      {errorMessage ? (
        <p className="activity-state activity-state--error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && predictions.length === 0 ? (
        <p className="activity-state">
          No predictions yet. Analyze a currency image to start history.
        </p>
      ) : null}

      <div className="activity-list">
        {predictions.map((item) => {
          const status = getConfidenceStatus(item.confidence)

          return (
            <article
              className="activity-item"
              key={item.predictionId ?? item._id ?? `${item.denomination}-${item.createdAt}`}
            >
              <div className="activity-item__thumb">
                {item.imageUrl ? (
                  <img alt={`${item.denomination} upload`} src={item.imageUrl} />
                ) : (
                  <Icon name="receipt_long" size="md" />
                )}
              </div>
              <div className="activity-item__content">
                <strong>{item.denomination}</strong>
                <span>{formatTime(item.createdAt)}</span>
              </div>
              <span className={`activity-item__score activity-item__score--${status}`}>
                {formatConfidence(item.confidence)}
              </span>
            </article>
          )
        })}
      </div>
    </aside>
  )
}

export default RecentActivity
