import { useState, useEffect } from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'

import styles from './ThemeToggle.module.css'

interface ThemeToggleProps {
    /** Size preset from global size variables */
    size?: 'sm' | 'md' | 'lg'
}

export function ThemeToggle({ size = 'md' }: ThemeToggleProps) {
    
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark')
        setIsDark(isDarkMode)
    }, [])

    const handleToggle = () => {
        document.documentElement.classList.toggle('dark')
        setIsDark(!isDark)
        localStorage.setItem('theme', isDark ? 'light' : 'dark')
    }

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            onClick={handleToggle}
            className={`${styles.toggle} ${styles[size]}`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div className={styles.track}>
                <div className={styles.ball}>
                    {isDark ? (
                        <FaMoon className={styles.icon} />
                    ) : (
                        <FaSun className={styles.icon} />
                    )}
                </div>
            </div>
        </button>
    )
}

