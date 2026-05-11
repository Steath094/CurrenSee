import type { AvailableModel } from '../../lib/api'
import Button from '../common/Button'

type ModelSelectorProps = {
  errorMessage?: string
  isLoading?: boolean
  models: AvailableModel[]
  onSelectModel: (version: string) => void
  selectedModelVersion: string
}

function getModelLabel(model: AvailableModel) {
  return `${model.name} (${model.version})`
}

function ModelSelector({
  errorMessage,
  isLoading = false,
  models,
  onSelectModel,
  selectedModelVersion,
}: ModelSelectorProps) {
  if (isLoading) {
    return (
      <div className="model-selector" aria-label="Prediction model selector">
        <Button disabled size="small" variant="chip">
          Loading models
        </Button>
      </div>
    )
  }

  if (errorMessage || models.length === 0) {
    return (
      <div className="model-selector" aria-label="Prediction model selector">
        <Button disabled size="small" variant="chip">
          {errorMessage ? 'Models unavailable' : 'No active models'}
        </Button>
      </div>
    )
  }

  return (
    <div className="model-selector" aria-label="Prediction model selector">
      {models.map((model) => (
        <Button
          active={model.version === selectedModelVersion}
          aria-label={model.description || getModelLabel(model)}
          key={model.version}
          onClick={() => onSelectModel(model.version)}
          size="small"
          title={model.description || undefined}
          variant="chip"
        >
          {getModelLabel(model)}
        </Button>
      ))}
    </div>
  )
}

export default ModelSelector
