import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { IoChevronBack } from 'react-icons/io5'

import { PasswordEyeInput } from '@/components/forms'
import { Button, Spinner, Card } from '@/components/ui'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/constants/routes'
import type { ChangePasswordRequest } from '@/types/auth'

import authStyles from '../Auth.module.css'

export function ChangePassword() {
    const navigate = useNavigate()
    const { changePassword, isLoading } = useAuthStore()

    const [formData, setFormData] = useState<ChangePasswordRequest>({
        old_password: '',
        new_password1: '',
        new_password2: '',
    })
    // Auth check is handled by ProtectedRoute

    const handleFormDataChange = (key: string, value: string) => {
        setFormData((prevState: ChangePasswordRequest) => ({
            ...prevState,
            [key]: value,
        }))
    }

    const validateForm = (formData: ChangePasswordRequest) => {
        const { old_password, new_password1, new_password2 } = formData
        
        if (!old_password || !new_password1 || !new_password2) {
            return { isValid: false, message: 'Please fill in all fields' }
        }
        
        // Password confirmation validation
        if (new_password1 !== new_password2) {
            return { isValid: false, message: 'Passwords do not match' }
        }

        // Check if new password is different from old password
        if (old_password === new_password1) {
            return { isValid: false, message: 'New password must be different from current password' }
        }
        
        // Password strength validation (optional)
        if (new_password1.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters long' }
        }
        
        return { isValid: true, message: '' }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        const validation = validateForm(formData)
        if (!validation.isValid) {
            toast.error(validation.message)
            return
        }

        try {
            const success = await changePassword(formData)
            if (success) {
                navigate(ROUTES.profile)
                return
            }
        } catch (error) {
            console.error('Change password error:', error)
        }
    }

    return (
        <div className={authStyles.container}>
            <div className={authStyles.header}>
                <button 
                    className={authStyles.backButton}
                    onClick={() => navigate(ROUTES.profile)}
                    aria-label="Back to profile"
                >
                    <IoChevronBack /> Back to Profile
                </button>
            </div>
            
            <Card className={authStyles.card}>
                <h1 className={authStyles.title}>Change Password</h1>

                <form className={authStyles.form} onSubmit={handleSubmit}>
                    <PasswordEyeInput
                        name="old_password"
                        value={formData.old_password}
                        setValue={(value) => handleFormDataChange('old_password', value)}
                        label="Current Password"
                        placeholder="Enter your current password"
                    />
                    <PasswordEyeInput
                        name="new_password1"
                        value={formData.new_password1}
                        setValue={(value) => handleFormDataChange('new_password1', value)}
                        label="New Password"
                        placeholder="Enter your new password"
                    />
                    <PasswordEyeInput
                        name="new_password2"
                        value={formData.new_password2}
                        setValue={(value) => handleFormDataChange('new_password2', value)}
                        label="Confirm Password"
                        placeholder="Confirm your new password"
                    />

                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner variant="secondary" size="sm" /> : 'Change Password'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}

