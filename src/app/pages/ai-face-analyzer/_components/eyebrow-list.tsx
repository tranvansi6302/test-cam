import { useCallback } from 'react'
import { Eyebrow } from '../eyebrow-store'
import { DraggableBoxV3 } from './result-analyzer/_components/DraggableBoxV3'
import { addBase64Prefix } from '../../../utils/convert'
import useBreakpoint from '../../../hooks/use-breakpoint'
import { useModalStore } from '../../../stores/modal.store'

// Định nghĩa interface cho PlacedBox
interface PlacedBox {
    id: string
    name: string
    image: string
    position: { x: number; y: number }
    flip?: boolean
}

// Định nghĩa interface cho props của EyebrowList
interface EyebrowListProps {
    availableEyebrows: Eyebrow[]
    placedBoxes: PlacedBox[]
    handleDoubleClick: (eyebrow: Eyebrow) => void
}

export const EyebrowList = ({ availableEyebrows, placedBoxes, handleDoubleClick }: EyebrowListProps) => {
    // Helper function để debug và biết chân mày nào active
    const getActiveEyebrows = useCallback(() => {
        const activeIds = new Set(placedBoxes.map((box) => box.id.split('-')[0]))

        return activeIds
    }, [placedBoxes])

    const breakpoints = useBreakpoint()
    const { openModalPreview } = useModalStore()
    const isActive = useCallback(
        (id: string) => {
            const activeEyebrows = getActiveEyebrows()
            const isEyebrowActive = activeEyebrows.has(id)

            return isEyebrowActive
        },
        [getActiveEyebrows]
    )

    return (
        <div
            className={`flex justify-start gap-2 ${
                breakpoints.desktop ||
                ((breakpoints.mobile || breakpoints.tabletLandscape || breakpoints.tabletPortrait) && openModalPreview)
                    ? 'flex-col'
                    : 'flex-row'
            }`}
        >
            {availableEyebrows.map((eyebrow) => (
                <DraggableBoxV3
                    key={eyebrow.id}
                    id={eyebrow.id}
                    name={eyebrow.name}
                    image={addBase64Prefix(eyebrow.image)}
                    onDoubleClick={() => handleDoubleClick(eyebrow)}
                    isActive={isActive(eyebrow.id)}
                    notActive={true}
                    className='p-2 border'
                />
            ))}
        </div>
    )
}
