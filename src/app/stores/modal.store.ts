import { create } from 'zustand'

//  onClose?: () => void
// toggleSyncMode?: () => void
// syncMode?: boolean
// handleClose?: () => void
interface ModalStore {
    openModalPreview: boolean
    setOpenModalPreview: (openModalPreview: boolean) => void
    toggleSyncMode: () => void
    syncMode: boolean
    handleClose: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
    openModalPreview: false,
    setOpenModalPreview: (openModalPreview: boolean) => set({ openModalPreview }),
    toggleSyncMode: () => set((state) => ({ syncMode: !state.syncMode })),
    syncMode: true,
    handleClose: () => set({ openModalPreview: false })
}))
