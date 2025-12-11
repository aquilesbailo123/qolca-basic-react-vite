import React from 'react'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Style variant of the button */
    variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'success'
    /** Size variant of the button */
    size?: 'sm' | 'md' | 'lg' | 'xl'
    /** Content of the button, can include text and/or icons */
    children: React.ReactNode
}

/**
 * Button component that follows the design system.
 * Can include an optional icon as a child element.
 */
export function Button({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button 
            className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
