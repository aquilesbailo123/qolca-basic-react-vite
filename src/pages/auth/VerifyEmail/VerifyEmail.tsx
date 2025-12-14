import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { Input } from '@/components/forms'
import { Button, Spinner, Card } from '@/components/ui'
import { IoChevronBack } from 'react-icons/io5'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/constants/routes'
import { logger } from '@/lib/logger'

import authStyles from '../Auth.module.css'
import styles from './VerifyEmail.module.css'

const RESEND_COOLDOWN_UNTIL_KEY = 'verify_email_resend_cooldown_until'

export function VerifyEmail() {
    const navigate = useNavigate()
    const { confirmEmail, resendConfirmationEmail, confirmEmailToken, isLoading, isLogged } = useAuthStore()
    
    const handleBackToLogin = () => {
        navigate(ROUTES.login)
    }

    const [code, setCode] = useState('')
    const [resendCooldownSeconds, setResendCooldownSeconds] = useState(() => {
        // If no token (after signup), clear any old cooldown and return 0
        if (!confirmEmailToken) {
            localStorage.removeItem(RESEND_COOLDOWN_UNTIL_KEY)
            return 0
        }

        // Token exists (after login) - check if there's an existing cooldown
        const rawUntil = localStorage.getItem(RESEND_COOLDOWN_UNTIL_KEY)
        const untilMs = rawUntil ? Number(rawUntil) : 0
        const remainingSeconds = Math.ceil((untilMs - Date.now()) / 1000)

        // If valid cooldown exists, use it
        if (remainingSeconds > 0) {
            return remainingSeconds
        }

        // No valid cooldown - set 5 minute cooldown after login
        const initialSeconds = 300
        localStorage.setItem(
            RESEND_COOLDOWN_UNTIL_KEY,
            String(Date.now() + initialSeconds * 1000)
        )
        return initialSeconds
    })
    const [isResending, setIsResending] = useState(false)

    useEffect(() => {
        if (isLogged) {
            navigate(ROUTES.home)
        }
    }, [isLogged, navigate])

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (resendCooldownSeconds <= 0) return

        const intervalId = window.setInterval(() => {
            setResendCooldownSeconds((s) => Math.max(0, s - 1))
        }, 1000)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [resendCooldownSeconds])

    useEffect(() => {
        if (resendCooldownSeconds > 0) return
        localStorage.removeItem(RESEND_COOLDOWN_UNTIL_KEY)
    }, [resendCooldownSeconds])

    const formatCooldown = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remaining = seconds % 60
        if (minutes <= 0) return `${seconds}s`
        return `${minutes}:${String(remaining).padStart(2, '0')}`
    }

    const setCooldownFromNow = (seconds: number) => {
        localStorage.setItem(
            RESEND_COOLDOWN_UNTIL_KEY,
            String(Date.now() + seconds * 1000)
        )
        setResendCooldownSeconds(seconds)
    }

    const validateCode = (code: string) => {
        if (!code || code.length !== 6) {
            return { isValid: false, message: 'Please enter a 6-digit verification code' }
        }
        
        if (!/^\d{6}$/.test(code)) {
            return { isValid: false, message: 'Code must contain only numbers' }
        }
        
        return { isValid: true, message: '' }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const validation = validateCode(code)
        if (!validation.isValid) {
            toast.error(validation.message)
            return
        }

        try {
            const success = await confirmEmail(code)
            if (success) {
                // Check if user was auto-logged in after verification
                const state = useAuthStore.getState()

                if (state.isLogged) {
                    navigate(ROUTES.home)
                } else {
                    navigate(ROUTES.login)
                }
                return;
            }
        } catch (error) {
            toast.error('Verification failed')
            logger.error('Verification error:', error)
        }
    }

    const handleResendCode = async () => {
        if (!confirmEmailToken) {
            toast.error('You must log in to resend the verification code')
            return
        }

        if (resendCooldownSeconds > 0 || isResending) return

        try {
            setIsResending(true)
            const result = await resendConfirmationEmail(confirmEmailToken)

            if (result === 'sent') {
                setCooldownFromNow(30)
            }

            if (result === 'in_progress') {
                setCooldownFromNow(5 * 60)
            }
        } catch (error) {
            toast.error('Failed to resend code')
            logger.error('Resend code error:', error)
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className={authStyles.container}>
            <div className={authStyles.header}>
                <button
                    className={authStyles.backButton}
                    onClick={handleBackToLogin}
                    aria-label="Back to login"
                >
                    <IoChevronBack /> Back to Login
                </button>
            </div>

            <Card className={authStyles.card}>
                <h1 className={authStyles.title}>Verify Email</h1>
                
                <p className={styles.description}>
                    Enter the 6-digit verification code sent to your email address.
                </p>

                <form className={authStyles.form} onSubmit={handleSubmit}>
                    <Input
                        name="code"
                        type="text"
                        value={code}
                        setValue={setCode}
                        label="Verification Code"
                        placeholder="123456"
                        maxLength={6}
                        variant="bordered"
                    />

                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        disabled={isLoading || isResending}
                    >
                        {isLoading ? <Spinner variant="secondary" size="sm" /> : 'Verify Email'}
                    </Button>

                    <Button
                        variant="secondary"
                        size="md"
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading || isResending || resendCooldownSeconds > 0}
                    >
                        {isResending ? (
                            <Spinner variant="primary" size="sm" />
                        ) : resendCooldownSeconds > 0 ? (
                            `Resend code (${formatCooldown(resendCooldownSeconds)})`
                        ) : (
                            'Resend code'
                        )}
                    </Button>
                </form>
            </Card>
        </div>
    )
}

