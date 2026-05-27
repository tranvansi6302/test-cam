// Simple store to keep track of eyebrow images
import eyebrow1 from '../../../assets/imgs/eyebrows_1.png'
import eyebrow2 from '../../../assets/imgs/eyebrows_2.png'

export interface Eyebrow {
    id: string
    name: string
    image: string
}

class EyebrowStore {
    private eyebrows: Eyebrow[] = [
        { id: 'eyebrow1', name: 'Eyebrow 1', image: eyebrow1 },
        { id: 'eyebrow2', name: 'Eyebrow 2', image: eyebrow2 }
    ]

    getAll(): Eyebrow[] {
        return this.eyebrows
    }

    getById(id: string): Eyebrow | undefined {
        return this.eyebrows.find((eyebrow) => eyebrow.id === id)
    }

    getImageById(id: string): string {
        const eyebrow = this.getById(id)
        return eyebrow ? eyebrow.image : ''
    }
}

// Create a singleton instance
export const eyebrowStore = new EyebrowStore()
