import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { IoChevronBack } from 'react-icons/io5'

import { Input, PasswordEyeInput } from '@/components/forms'
import { Button, Spinner, Card } from '@/components/ui'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/constants/routes'
import type { LoginRequest, AuthResult } from '@/types/auth'

import authStyles from '../Auth.module.css'

export function Login() {
    const navigate = useNavigate()
    const { logIn, isLoading, isLogged } = useAuthStore()

    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: '',
    })

    useEffect(() => {
        if (isLogged) {
            navigate(ROUTES.home)
        }
    }, [isLogged])

    const handleFormDataChange = (key: string, value: string) => {
        setFormData((prevState: LoginRequest) => ({
            ...prevState,
            [key]: value,
        }))
    }

    const validateForm = (formData: LoginRequest) => {
        const { email, password } = formData
        
        if (!email || !password) {
            return { isValid: false, message: 'Please fill in all fields' }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' }
        }
        
        return { isValid: true, message: '' }
    }

    const handleFormSubmit = async (e: any) => {
        e.preventDefault()

        const validation = validateForm(formData)
        if (!validation.isValid) {
            toast.error(validation.message)
            return
        }

        try {
            const status: AuthResult = await logIn(formData, () => console.log('2FA required'));

            if (status === 'success') {
                toast.success('Login successful')
                navigate(ROUTES.home)
            }

            if (status === 'confirm_email') {
                toast.success('Please confirm your email')
                navigate(ROUTES.verifyEmail)
            }

            return
        } catch (error) {
            toast.error('error')
            console.error('Login error:', error)
        }
    }

    // const handleLoginWithGoogle = async () => {
    //     return
    // }

    return (
        <div className={authStyles.container}>
            <div className={authStyles.header}>
                <button 
                    className={authStyles.backButton}
                    onClick={() => navigate(ROUTES.home)}
                    aria-label="Back to home"
                >
                    <IoChevronBack /> Back to Home
                </button>
            </div>
            <Card className={authStyles.card}>
                <h1 className={authStyles.title}>Welcome Back</h1>

                <form className={authStyles.form} onSubmit={handleFormSubmit}>
                    <Input
                        name="email"
                        value={formData.email}
                        setValue={(value) => handleFormDataChange('email', value)}
                        label="Email"
                        placeholder="Enter your email"
                    />
                    <PasswordEyeInput
                        name="password"
                        value={formData.password}
                        setValue={(value) => handleFormDataChange('password', value)}
                        label="Password"
                        placeholder="Enter your password"
                    />

                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner variant="secondary" size="sm" /> : 'Login'}
                    </Button>
                </form>
            
                <div className={authStyles.footer}>
                    <button 
                        className="text-btn"
                        onClick={() => navigate(ROUTES.forgotPassword)}
                    >
                        Forgot your password?
                    </button>
                </div>
            
                <div className={authStyles.footer}>
                    <span>Don't have an account?</span>
                    <button 
                        className="text-btn"
                        onClick={() => navigate(ROUTES.register)}
                    >
                        <span className={authStyles.link}>Sign Up</span>
                    </button>
                </div>
            </Card>
        </div>
    )
}

