import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {
    RiUserLine,
    RiSettingsLine,
    RiLogoutBoxRLine,
    RiLockPasswordLine,
    RiShieldCheckLine,
    RiMailLine,
    RiUser3Line,
    RiEditLine
} from 'react-icons/ri'

import { Button, Spinner } from '@/components/ui'
import { useAuthStore } from '@/stores/useAuthStore'
import { ROUTES } from '@/constants/routes'
import { sanitizeUserProfile } from '@/lib/sanitize'
import type { UserDetails } from '@/types/auth'
import styles from './Profile.module.css'

export function Profile() {
    const navigate = useNavigate()
    const { isLoading, logOut, getUser } = useAuthStore()
    const [activeTab, setActiveTab] = useState('profile')
    const [userDetails, setUserDetails] = useState<UserDetails | undefined>(undefined)
    const [profileLoading, setProfileLoading] = useState(true)
    const [loggingOut, setLoggingOut] = useState(false)
    
    useEffect(() => {
        setProfileLoading(true)
        setTimeout(() => {
            const userData = getUser()
            setUserDetails(userData ?? undefined)
            setProfileLoading(false)
        }, 500)
    }, [getUser])

    // Sanitize user data before display
    const sanitizedProfile = useMemo(() => {
        if (!userDetails) return null;
        return sanitizeUserProfile(userDetails);
    }, [userDetails]);

    const handleLogout = async () => {
        setLoggingOut(true)
        await logOut()
        navigate('/')
    }

    const handleChangePassword = () => {
        navigate(ROUTES.changePassword)
    }

    const handleSetup2FA = () => {
        toast.error("Not available yet")
    }

    if (isLoading || profileLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <Spinner size="lg" />
                    <p>Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!userDetails || !sanitizedProfile) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>Failed to load profile data</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        )
    }

    const displayName = sanitizedProfile.username || sanitizedProfile.email?.split('@')[0] || 'User'
    const initials = displayName.charAt(0).toUpperCase()
    
    return (
        <div className={styles.container}>
            <div className={styles.layout}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            <span>{initials}</span>
                        </div>
                        <h2 className={styles.userName}>{displayName}</h2>
                        <p className={styles.userEmail}>{sanitizedProfile.email}</p>
                    </div>
                    
                    <nav className={styles.nav}>
                        <button 
                            className={`${styles.navButton} ${activeTab === 'profile' ? styles.active : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <RiUserLine />
                            <span>Profile</span>
                        </button>
                        <button 
                            className={`${styles.navButton} ${activeTab === 'settings' ? styles.active : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <RiSettingsLine />
                            <span>Settings</span>
                        </button>
                    </nav>
                    
                    <div className={styles.sidebarFooter}>
                        <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className={styles.logoutButton}
                        >
                            {loggingOut ? (
                                <Spinner size="sm" variant="secondary" />
                            ) : (
                                <>
                                    <RiLogoutBoxRLine />
                                    Logout
                                </>
                            )}
                        </Button>
                    </div>
                </aside>
                
                {/* Main Content */}
                <main className={styles.main}>
                    {activeTab === 'profile' && (
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h1 className={styles.sectionTitle}>Profile Information</h1>
                                <Button variant="secondary" size="sm">
                                    <RiEditLine />
                                    Edit
                                </Button>
                            </div>
                            
                            <div className={styles.card}>
                                <div className={styles.fieldGroup}>
                                    <div className={styles.field}>
                                        <div className={styles.fieldIcon}>
                                            <RiUser3Line />
                                        </div>
                                        <div className={styles.fieldContent}>
                                            <label className={styles.fieldLabel}>Username</label>
                                            <p className={styles.fieldValue}>{sanitizedProfile.username || '-'}</p>
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <div className={styles.fieldIcon}>
                                            <RiMailLine />
                                        </div>
                                        <div className={styles.fieldContent}>
                                            <label className={styles.fieldLabel}>Email</label>
                                            <p className={styles.fieldValue}>{sanitizedProfile.email}</p>
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <div className={styles.fieldIcon}>
                                            <RiUserLine />
                                        </div>
                                        <div className={styles.fieldContent}>
                                            <label className={styles.fieldLabel}>First Name</label>
                                            <p className={styles.fieldValue}>{sanitizedProfile.first_name || '-'}</p>
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <div className={styles.fieldIcon}>
                                            <RiUserLine />
                                        </div>
                                        <div className={styles.fieldContent}>
                                            <label className={styles.fieldLabel}>Last Name</label>
                                            <p className={styles.fieldValue}>{sanitizedProfile.last_name || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {activeTab === 'settings' && (
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h1 className={styles.sectionTitle}>Security Settings</h1>
                            </div>
                            
                            <div className={styles.card}>
                                <div className={styles.settingItem}>
                                    <div className={styles.settingIcon}>
                                        <RiLockPasswordLine />
                                    </div>
                                    <div className={styles.settingContent}>
                                        <h3 className={styles.settingTitle}>Change Password</h3>
                                        <p className={styles.settingDescription}>Update your password regularly for security</p>
                                    </div>
                                    <Button variant="secondary" size="sm" onClick={handleChangePassword}>
                                        Change
                                    </Button>
                                </div>
                                
                                <div className={styles.divider} />
                                
                                <div className={styles.settingItem}>
                                    <div className={styles.settingIcon}>
                                        <RiShieldCheckLine />
                                    </div>
                                    <div className={styles.settingContent}>
                                        <h3 className={styles.settingTitle}>Two-Factor Authentication</h3>
                                        <p className={styles.settingDescription}>Add an extra layer of security to your account</p>
                                    </div>
                                    <Button variant="primary" size="sm" onClick={handleSetup2FA}>
                                        Setup
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    )
}

