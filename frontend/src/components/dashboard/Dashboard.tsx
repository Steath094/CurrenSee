import { useCallback, useEffect, useState } from 'react'
import Upload from '../Upload'
import type {
  CurrencyPrediction,
  PredictionApiResponse,
  PredictionRecord,
} from '../../types/prediction'
import {
  getModels,
  getApiErrorMessage,
  getPredictionPreview,
  postPrediction,
  type AvailableModel,
  submitFeedback,
} from '../../lib/api'
import MobileNav from './MobileNav'
import ModelSelector from './ModelSelector'
import PredictionHistory from './PredictionHistory'
import PredictionResult from './PredictionResult'
import RecentActivity from './RecentActivity'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import type { DashboardView } from './dashboardData'

type Feedback = 'positive' | 'negative' | null

function normalizeConfidence(value: PredictionApiResponse['confidence']) {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseFloat(value)
        : 0

  if (!Number.isFinite(numeric)) {
    return 0
  }

  const scaledConfidence = numeric <= 1 ? numeric * 100 : numeric

  return Math.round(Math.max(0, Math.min(100, scaledConfidence)))
}

function normalizeDenomination(value: string | number | undefined) {
  if (value === undefined || value === '') {
    return 'Unknown'
  }

  const rawValue = String(value).trim()
  const isPlainNumber = /^\d+$/.test(rawValue)

  return isPlainNumber ? `Rs. ${rawValue}` : rawValue
}

function inferCurrency(denomination: string) {
  if (denomination.startsWith('Rs.')) {
    return 'Indian Rupee'
  }

  if (denomination.startsWith('$')) {
    return 'US Dollar'
  }

  if (denomination.startsWith('EUR')) {
    return 'Euro'
  }

  return 'Currency Note'
}

function normalizePrediction(data: PredictionApiResponse): CurrencyPrediction {
  const denomination = normalizeDenomination(
    data.denomination ?? data.prediction ?? data.label,
  )
  const confidence = normalizeConfidence(data.confidence ?? data.score)
  const normalizedPrediction: CurrencyPrediction = {
    confidence,
    currency: data.currency ?? inferCurrency(denomination),
    denomination,
    imageUrl: data.imageUrl ?? null,
    series:
      data.series ??
      (data.modelVersion ? `Model ${data.modelVersion}` : 'Model Prediction'),
  }

  if (data.modelVersion) {
    normalizedPrediction.modelVersion = data.modelVersion
  }

  if (data.predictionId) {
    normalizedPrediction.predictionId = data.predictionId
  }

  return normalizedPrediction
}

type DashboardProps = {
  onSignOut: () => void
}

function Dashboard({ onSignOut }: DashboardProps) {
  const [activeView, setActiveView] = useState<DashboardView>('scan')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [feedbackError, setFeedbackError] = useState<string>()
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRecentActivityLoading, setIsRecentActivityLoading] = useState(false)
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([])
  const [isModelsLoading, setIsModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string>()
  const [prediction, setPrediction] = useState<CurrencyPrediction>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [recentActivityError, setRecentActivityError] = useState<string>()
  const [recentPredictions, setRecentPredictions] = useState<PredictionRecord[]>(
    [],
  )
  const [selectedFile, setSelectedFile] = useState<File>()
  const [selectedModelVersion, setSelectedModelVersion] = useState('')
  const [uploadError, setUploadError] = useState<string>()

  const loadRecentActivity = useCallback(async () => {
    setIsRecentActivityLoading(true)
    setRecentActivityError(undefined)

    try {
      const response = await getPredictionPreview()
      setRecentPredictions(response.predictions)
    } catch (error) {
      setRecentActivityError(getApiErrorMessage(error))
    } finally {
      setIsRecentActivityLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(undefined)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  useEffect(() => {
    void loadRecentActivity()
  }, [loadRecentActivity])

  useEffect(() => {
    let isMounted = true

    const loadModels = async () => {
      setIsModelsLoading(true)
      setModelsError(undefined)

      try {
        const models = await getModels()

        if (!isMounted) {
          return
        }

        setAvailableModels(models)
        setSelectedModelVersion((currentVersion) =>
          models.some((model) => model.version === currentVersion)
            ? currentVersion
            : (models[0]?.version ?? ''),
        )
      } catch (error) {
        if (isMounted) {
          setModelsError(getApiErrorMessage(error))
        }
      } finally {
        if (isMounted) {
          setIsModelsLoading(false)
        }
      }
    }

    void loadModels()

    return () => {
      isMounted = false
    }
  }, [])

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
    setUploadError(undefined)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setUploadError('Select a currency image before analyzing.')
      return
    }

    if (!selectedModelVersion) {
      setUploadError('No active prediction model is available.')
      return
    }

    const formData = new FormData()
    formData.append('predictionImage', selectedFile)
    formData.append('modelVersion', selectedModelVersion)

    setFeedback(null)
    setFeedbackError(undefined)
    setIsAnalyzing(true)
    setUploadError(undefined)

    try {
      const response = await postPrediction<PredictionApiResponse>(formData)
      setPrediction(normalizePrediction(response))
      await loadRecentActivity()
    } catch (error) {
      setUploadError(getApiErrorMessage(error))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFeedback = async (wasCorrect: boolean, correctedLabel?: string) => {
    if (!prediction?.predictionId) {
      return
    }

    setFeedbackError(undefined)
    setIsFeedbackSubmitting(true)

    try {
      await submitFeedback(prediction.predictionId, wasCorrect, correctedLabel)
      setFeedback(wasCorrect ? 'positive' : 'negative')
      await loadRecentActivity()
    } catch (error) {
      setFeedbackError(getApiErrorMessage(error))
    } finally {
      setIsFeedbackSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onSignOut={onSignOut}
      />

      <div className="dashboard-shell">
        <TopBar />

        {activeView === 'scan' ? (
          <main className="dashboard-main">
            <section className="analysis-column" aria-label="Currency analysis">
              <ModelSelector
                errorMessage={modelsError}
                isLoading={isModelsLoading}
                models={availableModels}
                onSelectModel={setSelectedModelVersion}
                selectedModelVersion={selectedModelVersion}
              />

              <Upload
                errorMessage={uploadError}
                isAnalyzeDisabled={isModelsLoading || !selectedModelVersion}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleAnalyze}
                onFileSelected={handleFileSelected}
                previewUrl={previewUrl}
                selectedFileName={selectedFile?.name}
              />

              {prediction ? (
                <PredictionResult
                  errorMessage={feedbackError}
                  feedback={feedback}
                  isFeedbackSubmitting={isFeedbackSubmitting}
                  onFeedback={handleFeedback}
                  result={prediction}
                />
              ) : null}
            </section>

            <RecentActivity
              errorMessage={recentActivityError}
              isLoading={isRecentActivityLoading}
              onViewAll={() => setActiveView('history')}
              predictions={recentPredictions}
            />
          </main>
        ) : (
          <PredictionHistory />
        )}
      </div>

      <MobileNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  )
}

export default Dashboard
