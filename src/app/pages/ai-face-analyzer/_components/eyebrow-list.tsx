import { Eyebrow } from '../eyebrow-store'
import { DraggableBoxV3 } from './result-analyzer/_components/DraggableBoxV3'
import { addBase64Prefix } from '../../../utils/convert'
import useBreakpoint from '../../../hooks/use-breakpoint'

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

export const EyebrowList = ({ availableEyebrows, handleDoubleClick }: EyebrowListProps) => {
    const breakpoints = useBreakpoint()

    return (
        <div
            className={`flex justify-start gap-2 ${
                breakpoints.desktop
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
                    notActive={true}
                    className='p-2 border'
                />
            ))}
        </div>
    )
}
