import toast from 'react-hot-toast'
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoChevronBack, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'

import { Input, PasswordEyeInput } from '@/components/forms'
import { Button, Card, Spinner } from '@/components/ui'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/constants/routes'
import { sanitizeEmail } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import type { SignupRequest } from '@/types/auth'

import authStyles from '../Auth.module.css'
import styles from './Register.module.css'

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
    }, [isLogged, navigate])

    const handleFormDataChange = (key: string, value: string) => {
        setFormData((prevState: SignupRequest) => ({
            ...prevState,
            [key]: value,
        }))
    }

    // Password strength requirements
    const passwordRequirements = useMemo(() => {
        const password = formData.password1
        return {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        }
    }, [formData.password1])

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

        // Password strength validation - check all requirements
        if (!passwordRequirements.minLength) {
            return { isValid: false, message: 'Password must be at least 8 characters long' }
        }
        if (!passwordRequirements.hasUppercase) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter' }
        }
        if (!passwordRequirements.hasLowercase) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter' }
        }
        if (!passwordRequirements.hasNumber) {
            return { isValid: false, message: 'Password must contain at least one number' }
        }
        if (!passwordRequirements.hasSpecialChar) {
            return { isValid: false, message: 'Password must contain at least one special character' }
        }

        // Password confirmation validation
        if (password1 !== password2) {
            return { isValid: false, message: 'Passwords do not match' }
        }

        return { isValid: true, message: '' }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const validation = validateForm(formData);
        if (!validation.isValid) {
            toast.error(validation.message);
            return;
        }

        // Sanitize inputs before sending to API
        const sanitizedData: SignupRequest = {
            email: sanitizeEmail(formData.email),
            password1: formData.password1, // Don't sanitize passwords
            password2: formData.password2, // Don't sanitize passwords
        }

        try {
            const status: boolean = await register(sanitizedData);
            if (status) {
                navigate(ROUTES.verifyEmail);
                return;
            }
            toast.error('Registration failed');
        } catch (error) {
            toast.error('An error occurred during registration');
            logger.error('Registration error:', error);
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
                    <div>
                        <PasswordEyeInput
                            name="password1"
                            value={formData.password1}
                            setValue={(v) => handleFormDataChange('password1', v)}
                            label="Password"
                            placeholder="Enter your password"
                        />

                        {formData.password1 && (
                            <div className={styles.passwordRequirements}>
                                <div className={`${styles.requirement} ${passwordRequirements.minLength ? styles.met : ''}`}>
                                    {passwordRequirements.minLength ? (
                                        <IoCheckmarkCircle className={styles.iconMet} />
                                    ) : (
                                        <IoCloseCircle className={styles.iconUnmet} />
                                    )}
                                    <span>At least 8 characters</span>
                                </div>
                                <div className={`${styles.requirement} ${passwordRequirements.hasUppercase ? styles.met : ''}`}>
                                    {passwordRequirements.hasUppercase ? (
                                        <IoCheckmarkCircle className={styles.iconMet} />
                                    ) : (
                                        <IoCloseCircle className={styles.iconUnmet} />
                                    )}
                                    <span>One uppercase letter</span>
                                </div>
                                <div className={`${styles.requirement} ${passwordRequirements.hasLowercase ? styles.met : ''}`}>
                                    {passwordRequirements.hasLowercase ? (
                                        <IoCheckmarkCircle className={styles.iconMet} />
                                    ) : (
                                        <IoCloseCircle className={styles.iconUnmet} />
                                    )}
                                    <span>One lowercase letter</span>
                                </div>
                                <div className={`${styles.requirement} ${passwordRequirements.hasNumber ? styles.met : ''}`}>
                                    {passwordRequirements.hasNumber ? (
                                        <IoCheckmarkCircle className={styles.iconMet} />
                                    ) : (
                                        <IoCloseCircle className={styles.iconUnmet} />
                                    )}
                                    <span>One number</span>
                                </div>
                                <div className={`${styles.requirement} ${passwordRequirements.hasSpecialChar ? styles.met : ''}`}>
                                    {passwordRequirements.hasSpecialChar ? (
                                        <IoCheckmarkCircle className={styles.iconMet} />
                                    ) : (
                                        <IoCloseCircle className={styles.iconUnmet} />
                                    )}
                                    <span>One special character (!@#$%...)</span>
                                </div>
                            </div>
                        )}
                    </div>

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

