import React from 'react'
import styles from './CardTitle.module.css'

/**
 * Card title for the Card
 */
type CardTitleProps = {
    /** The content to be rendered inside the container */
    children: React.ReactNode;
    /** Additional CSS classes for custom styling (optional) */
    className?: string;
    /** OnClick callback */
    onClick?: () => any
}

export function CardTitle({ children, className, onClick }: CardTitleProps) {
    return (
        <div className={`${styles.title} ${className || ''}`} onClick={onClick}>
            {children}
        </div>
    )
}