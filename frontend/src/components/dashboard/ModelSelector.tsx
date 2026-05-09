import Button from '../common/Button'

const models = ['Model v1 Fast', 'Model v2 Accurate']

type ModelSelectorProps = {
  onSelectModel: (model: string) => void
  selectedModel: string
}

function ModelSelector({ onSelectModel, selectedModel }: ModelSelectorProps) {
  return (
    <div className="model-selector" aria-label="Prediction model selector">
      {models.map((model) => (
        <Button
          active={model === selectedModel}
          key={model}
          onClick={() => onSelectModel(model)}
          size="small"
          variant="chip"
        >
          {model}
        </Button>
      ))}
    </div>
  )
}

export default ModelSelector
