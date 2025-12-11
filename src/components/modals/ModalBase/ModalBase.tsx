import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { RiCloseLine } from "react-icons/ri"

import { useModalStore } from "@/stores/useModalStore"
import styles from "./ModalBase.module.css"

export function ModalBase() {
    
    const isModalOpen = useModalStore((state) => state.isOpen)
    const isClosing = useModalStore((state) => state.isClosing)
    const closeModal = useModalStore((state) => state.closeModal)
    const modalContent = useModalStore((state) => state.content)
    
    const location = useLocation()

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeModal()
        }
    }

    // Close modal on route change
    useEffect(() => {
        if (isModalOpen && !isClosing) {
            closeModal()
        }
    }, [location.pathname])

    if (!isModalOpen && !isClosing) return null

    return (
        <div 
            className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} 
            onClick={handleOverlayClick}
        >
            <div className={styles.content}>
                <button 
                    className={styles.closeButton}
                    onClick={closeModal}
                    aria-label="Close modal"
                >
                    <RiCloseLine size={24} />
                </button>
                {modalContent && <div>{modalContent}</div>}
            </div>
        </div>
    )
}

