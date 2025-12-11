import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { Input } from '@/components/forms'
import { Button, Spinner, Card } from '@/components/ui'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/constants/routes'

import authStyles from '../Auth.module.css'
import styles from './VerifyEmail.module.css'

export function VerifyEmail() {
    const navigate = useNavigate()
    const { confirmEmail, isLoading, isLogged } = useAuthStore()

    const [code, setCode] = useState('')

    useEffect(() => {
        if (isLogged) {
            navigate(ROUTES.home)
        }
    }, [isLogged])

    const validateCode = (code: string) => {
        if (!code || code.length !== 6) {
            return { isValid: false, message: 'Please enter a 6-digit verification code' }
        }
        
        if (!/^\d{6}$/.test(code)) {
            return { isValid: false, message: 'Code must contain only numbers' }
        }
        
        return { isValid: true, message: '' }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        const validation = validateCode(code)
        if (!validation.isValid) {
            toast.error(validation.message)
            return
        }

        try {
            const success = await confirmEmail(code)
            if (success) {
                navigate(ROUTES.login)
                return;
            }
        } catch (error) {
            toast.error('Verification failed')
            console.error('Verification error:', error)
        }
    }

    return (
        <div className={authStyles.container}>
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
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner variant="secondary" size="sm" /> : 'Verify Email'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}

