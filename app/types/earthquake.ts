export interface Earthquake {
  id: number
  sourceId: string
  timestamp: string
  latitude: number
  longitude: number
  magnitude: number
  depth: number
  additionalData: {
    place?: string
    flynn_region?: string
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
}
