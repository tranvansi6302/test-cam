import { create } from 'zustand'
import { ORIGINAL_EYEBROW } from '../pages/ai-face-analyzer/config'
import { Eyebrow, eyebrowStore } from '../pages/ai-face-analyzer/eyebrow-store'

// Định nghĩa interface cho PlacedBox
interface PlacedBox {
    id: string
    name: string
    image: string
    position: { x: number; y: number }
    flip?: boolean
}

// Định nghĩa interface cho trạng thái store
interface EyebrowListState {
    availableEyebrows: Eyebrow[]
    placedBoxes: PlacedBox[]
    dropZoneWidth: number
    dropZoneHeight: number
    eyebrowSize: { width: number; height: number }
    savedPosition: { x: number; y: number } | null
    openModalPreview: boolean
    setPlacedBoxes: (boxes: PlacedBox[]) => void
    setSavedPosition: (position: { x: number; y: number } | null) => void
    setOpenModalPreview: (open: boolean) => void
    setDropZoneSize: (width: number, height: number) => void
    setEyebrowSize: (size: { width: number; height: number }) => void
    handleDoubleClick: (eyebrow: Eyebrow) => void
    base64RemoveEyebrow: string
    setBase64RemoveEyebrow: (base64: string) => void
    base64WithEyebrow: string
    setBase64WithEyebrow: (base64: string) => void
}

// Tạo store
export const useEyebrowListStore = create<EyebrowListState>((set, get) => ({
    availableEyebrows: eyebrowStore.getAll(),
    placedBoxes: [],
    dropZoneWidth: 0,
    dropZoneHeight: 0,
    eyebrowSize: {
        width: ORIGINAL_EYEBROW.width,
        height: ORIGINAL_EYEBROW.height
    },
    savedPosition: null,
    openModalPreview: false,
    base64RemoveEyebrow: '',
    base64WithEyebrow: '',
    setPlacedBoxes: (boxes) => set({ placedBoxes: boxes }),
    setSavedPosition: (position) => set({ savedPosition: position }),
    setOpenModalPreview: (open) => set({ openModalPreview: open }),
    setDropZoneSize: (width, height) => set({ dropZoneWidth: width, dropZoneHeight: height }),
    setEyebrowSize: (size) => set({ eyebrowSize: size }),
    setBase64RemoveEyebrow: (base64) => set({ base64RemoveEyebrow: base64 }),
    setBase64WithEyebrow: (base64) => set({ base64WithEyebrow: base64 }),
    handleDoubleClick: (eyebrow) => {
        const { dropZoneWidth, dropZoneHeight, eyebrowSize, placedBoxes, savedPosition } = get()

        // Logic handleDoubleClick từ FaceAnalyzerImgSet
        const defaultX = dropZoneWidth / 4
        const defaultY = dropZoneHeight / 2
        const isRightEyebrow = eyebrow.id.endsWith('-right')

        const existingBox = placedBoxes.find((box) => (isRightEyebrow ? box.flip : !box.flip))

        let positionX = defaultX
        let positionY = defaultY

        if (existingBox) {
            positionX = existingBox.position.x
            positionY = existingBox.position.y
        } else if (savedPosition) {
            positionX = savedPosition.x
            positionY = savedPosition.y
        } else if (isRightEyebrow) {
            positionX = dropZoneWidth - defaultX - eyebrowSize.width
        }

        // Hàm placeSymmetricEyebrows (đơn giản hóa để ví dụ)
        const placeSymmetricEyebrows = (id: string, name: string, image: string, x: number, y: number) => {
            const leftEyebrow = {
                id: isRightEyebrow ? id.replace('-right', '') : id,
                name: isRightEyebrow ? name.replace('-right', '') : name,
                image,
                position: {
                    x: isRightEyebrow ? dropZoneWidth - x - eyebrowSize.width : x,
                    y
                },
                flip: false
            }

            const rightEyebrow = {
                id: isRightEyebrow ? id : `${id}-right`,
                name: isRightEyebrow ? name : `${name}-right`,
                image,
                position: {
                    x: isRightEyebrow ? x : dropZoneWidth - x - eyebrowSize.width,
                    y
                },
                flip: true
            }

            set({ placedBoxes: [leftEyebrow, rightEyebrow] })
            set({ savedPosition: { x, y } })
        }

        placeSymmetricEyebrows(eyebrow.id, eyebrow.name, eyebrow.image, positionX, positionY)

        set({ openModalPreview: true })
    }
}))
