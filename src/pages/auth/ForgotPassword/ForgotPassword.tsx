import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { IoChevronBack } from 'react-icons/io5'

import { Card, Button, Spinner } from '@/components/ui'
import { Input } from '@/components/forms'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/useAuthStore'
import type { ResetPasswordRequest } from '@/types/auth'

import authStyles from '../Auth.module.css'


export function ForgotPassword() {
    const navigate = useNavigate()
    const { requestPasswordReset, isLoading, isLogged } = useAuthStore()

    const [formData, setFormData] = useState<ResetPasswordRequest>({
        email: '',
    })

    useEffect(() => {
        if (isLogged) {
            navigate(ROUTES.home);
        }
    }, [isLogged]);

    const handleFormDataChange = (key: string, value: string) => {
        setFormData((prevState: ResetPasswordRequest) => ({
            ...prevState,
            [key]: value,
        }))
    }

    const validateForm = (formData: ResetPasswordRequest) => {
        const { email } = formData;
        
        if (!email) {
            return { isValid: false, message: 'Please fill in all fields' }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' }
        }
        
        return { isValid: true, message: '' }
    }

    const onSubmit = async (e: any) => {
        e.preventDefault();

        const validation = validateForm(formData)
        if (!validation.isValid) {
            toast.error(validation.message);
            return;
        }

        try {
            const status: boolean = await requestPasswordReset(formData);
            if (status) {
                navigate(ROUTES.login);
                return;
            }
        } catch (e) {
            toast.error('An error occurred')
        }
    }

    return (
        <div className={authStyles.container}>
            <div className={authStyles.header}>
                <button
                    className={authStyles.backButton}
                    onClick={() => navigate('/login')}
                    aria-label="Back to login"
                >
                    <IoChevronBack /> Back to Login
                </button>
            </div>

            <Card className={authStyles.card}>
                <h1 className={authStyles.title}>Reset Password</h1>
                <form className={authStyles.form} onSubmit={onSubmit}>
                    <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        setValue={(value) => handleFormDataChange('email', value)}
                        label="Email"
                        placeholder="Enter your email"
                    />
                    <Button variant="primary" size="md" type="submit" disabled={isLoading}>
                        {isLoading ? <Spinner variant="secondary" size="sm" /> : 'Send Reset Link'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}

