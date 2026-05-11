import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import Button from './common/Button'
import Icon from './common/Icon'

type UploadProps = {
  errorMessage?: string
  isAnalyzeDisabled?: boolean
  isAnalyzing: boolean
  onAnalyze: () => void
  onFileSelected: (file: File) => void
  previewUrl?: string
  selectedFileName?: string
}

function Upload({
  errorMessage,
  isAnalyzeDisabled = false,
  isAnalyzing,
  onAnalyze,
  onFileSelected,
  previewUrl,
  selectedFileName,
}: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      onFileSelected(file)
    }

    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]

    if (file) {
      onFileSelected(file)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  return (
    <>
      <section
        className={`upload-card ${isDragging ? 'is-dragging' : ''}`}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          accept="image/*"
          className="sr-only"
          name="predictionImage"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />

        {previewUrl ? (
          <div className="upload-card__preview">
            <img alt="Selected currency preview" src={previewUrl} />
          </div>
        ) : (
          <div className="upload-card__icon">
            <Icon name="cloud_upload" size="xl" />
          </div>
        )}

        <h3>Drag & Drop Image Here</h3>
        <p>
          Upload a clear image of the currency note for high-precision detection
          and authenticity scoring.
        </p>

        {selectedFileName ? (
          <span className="upload-card__file">{selectedFileName}</span>
        ) : null}

        {errorMessage ? (
          <span className="upload-card__error" role="alert">
            {errorMessage}
          </span>
        ) : null}

        <Button
          onClick={() => fileInputRef.current?.click()}
          size="small"
          variant="primary"
        >
          Select File
        </Button>
      </section>

      <Button
        className="analyze-button"
        disabled={isAnalyzing || isAnalyzeDisabled}
        fullWidth
        onClick={onAnalyze}
        size="large"
        variant="primary"
      >
        <Icon name={isAnalyzing ? 'hourglass_top' : 'analytics'} size="sm" />
        {isAnalyzing ? 'Analyzing...' : 'Analyze Currency'}
      </Button>
    </>
  )
}

export default Upload
