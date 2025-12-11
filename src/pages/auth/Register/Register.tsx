import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoChevronBack } from 'react-icons/io5'

import { Input, PasswordEyeInput } from '@/components/forms'
import { Button, Card, Spinner } from '@/components/ui'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/constants/routes'
import type { SignupRequest } from '@/types/auth'

import authStyles from '../Auth.module.css'

export function Register() {
    const navigate = useNavigate()
    const { register, isLoading, isLogged } = useAuthStore()

    const [formData, setFormData] = useState<SignupRequest>({
        email: '',
        password1: '',
        password2: '',
    })

    useEffect(() => {
        if (isLogged) {
            navigate(ROUTES.home)
        }
    }, [isLogged])

    const handleFormDataChange = (key: string, value: string) => {
        setFormData((prevState: SignupRequest) => ({
            ...prevState,
            [key]: value,
        }))
    }

    const validateForm = (formData: SignupRequest) => {
        const { email, password1, password2 } = formData
        
        if (!email || !password1 || !password2) {
            return { isValid: false, message: 'Please fill in all fields' }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' }
        }
        
        // Password validation
        if (password1 !== password2) {
            return { isValid: false, message: 'Passwords do not match' }
        }
        
        return { isValid: true, message: '' }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        const validation = validateForm(formData);
        if (!validation.isValid) {
            toast.error(validation.message);
            return;
        }

        try {
            const status: boolean = await register(formData);
            if (status) {
                navigate(ROUTES.verifyEmail);
                return;
            }
            toast.error('Registration failed');
        } catch (error) {
            toast.error('error');
            console.error('Login error:', error);
        }
    }

    // const handleLoginWithGoogle = () => {
    //     // TODO: implement Google OAuth flow
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
                <h1 className={authStyles.title}>Create Account</h1>

                <form className={authStyles.form} onSubmit={handleSubmit}>
                    <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        setValue={(v) => handleFormDataChange('email', v)}
                        label="Email"
                        placeholder="Enter your email"
                    />
                    <PasswordEyeInput
                        name="password1"
                        value={formData.password1}
                        setValue={(v) => handleFormDataChange('password1', v)}
                        label="Password"
                        placeholder="Enter your password"
                    />
                    <PasswordEyeInput
                        name="password2"
                        value={formData.password2}
                        setValue={(v) => handleFormDataChange('password2', v)}
                        label="Confirm Password"
                        placeholder="Confirm your password"
                    />

                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner variant="secondary" size="sm" /> : 'Sign Up'}
                    </Button>
                </form>

                <div className={authStyles.footer}>
                    <span>Already have an account?</span>
                    <button className="text-btn" onClick={() => navigate(ROUTES.login)}>
                        <span className={authStyles.link}>Login</span>
                    </button>
                </div>
            </Card>
        </div>
    )
}

