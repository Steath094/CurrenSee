export type CurrencyPrediction = {
  denomination: string
  currency: string
  series: string
  confidence: number
  predictionId?: string
}

export type PredictionApiResponse = {
  denomination?: string | number
  prediction?: string | number
  label?: string | number
  predictionId?: string
  currency?: string
  series?: string
  confidence?: string | number
  score?: string | number
}

export type PredictionRecord = {
  _id: string
  confidence: number
  createdAt?: string
  denomination: string
  imageUrl?: string | null
  isCorrect?: boolean | null
  modelVersion: string
  updatedAt?: string
}

export type PredictionHistoryResponse = {
  pagination: {
    limit: number
    page: number
    total: number
    totalPages: number
  }
  predictions: PredictionRecord[]
}

export type PredictionPreviewResponse = {
  predictions: PredictionRecord[]
}
