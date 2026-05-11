export type CurrencyPrediction = {
  denomination: string
  currency: string
  series: string
  confidence: number
  imageUrl?: string | null
  modelVersion?: string
  predictionId?: string
}

export type PredictionApiResponse = {
  denomination?: string | number
  prediction?: string | number
  label?: string | number
  predictionId?: string
  imageUrl?: string | null
  modelVersion?: string
  currency?: string
  series?: string
  confidence?: string | number
  score?: string | number
}

export type PredictionRecord = {
  _id?: string
  confidence: number
  createdAt?: string
  denomination: string
  imageUrl?: string | null
  isCorrect?: boolean | null
  modelVersion: string
  predictionId?: string
  updatedAt?: string
}

export type PredictionHistoryResponse = {
  predictions: PredictionRecord[]
}

export type PredictionPreviewResponse = {
  predictions: PredictionRecord[]
}
