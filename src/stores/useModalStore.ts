// store/useModalStore.ts
import { create } from 'zustand';
import type { ReactElement } from 'react';

const ANIMATION_DURATION = 200;

interface ModalContentProps {
    handleClose?: () => void;
}

interface ModalState {
    isOpen: boolean;
    isClosing: boolean;
    content: ReactElement<ModalContentProps> | null;
}

interface ModalActions {
    openModal: (content: ReactElement<ModalContentProps>) => void;
    closeModal: () => void;
    _resetModal: () => void;
}

type ModalStore = ModalState & ModalActions;

export const useModalStore = create<ModalStore>()((set, get) => ({
    // State
    isOpen: false,
    isClosing: false,
    content: null,

    // Actions
    openModal: (content) => set({ isOpen: true, isClosing: false, content }),
    closeModal: () => {
        const { isClosing, content } = get();
        if (isClosing) return; // Prevent double-close
        
        // Call handleClose prop if exists
        if (content && typeof content.props.handleClose === 'function') {
            content.props.handleClose();
        }
        
        set({ isClosing: true });
        setTimeout(() => {
            set({ isOpen: false, isClosing: false, content: null });
        }, ANIMATION_DURATION);
    },
    _resetModal: () => set({ isOpen: false, isClosing: false, content: null }),
}));