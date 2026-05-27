import { create } from 'zustand'
import { FaceParamType } from '../pages/ai-face-analyzer/ai-face-analyzer'
import { AdjustmentResponseType, EyebrowPointType } from '../types/types'
import { Eyebrow } from '../pages/ai-face-analyzer/eyebrow-store'

interface AnalysisStore {
    faceParam: FaceParamType
    analysisData: AdjustmentResponseType | null
    setFaceParam: (faceParam: FaceParamType) => void
    setAnalysisData: (analysisData: AdjustmentResponseType | null) => void // Allow null
    isCallParamChange: boolean
    setIsCallParamChange: (isCallParamChange: boolean) => void
    setEyebrowList: (eyebrowList: Eyebrow[]) => void
    eyebrowList: Eyebrow[] | null | undefined
    eyesBrows: EyebrowPointType | null
    setEyesBrows: (eyesBrows: EyebrowPointType | null) => void // Allow null
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
    faceParam: {
        goldenRatio: undefined,
        userRatio: undefined,
        accuracy: undefined
    },
    analysisData: null,
    isCallParamChange: false,
    eyebrowList: undefined,
    setFaceParam: (faceParam: FaceParamType) => set({ faceParam }),
    setAnalysisData: (analysisData: AdjustmentResponseType | null) => set({ analysisData }),
    setIsCallParamChange: (isCallParamChange: boolean) => set({ isCallParamChange }),
    setEyebrowList: (eyebrowList: Eyebrow[] | null | undefined) => set({ eyebrowList }),
    eyesBrows: null,
    setEyesBrows: (eyesBrows: EyebrowPointType | null) => set({ eyesBrows })
}))
