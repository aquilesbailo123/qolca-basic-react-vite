import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
    RiHome3Line,
    RiMenuLine,
    RiCloseLine,
    RiUserLine,
} from 'react-icons/ri'
import { useEffect, useState } from 'react'

import { ROUTES } from '@/constants/routes'
import { LOGO, PROJECT_NAME } from "@/constants/common"
import { useAuthStore } from '@/stores/useAuthStore'
import type { UserDetails } from '@/types/auth'
import { Button, Spinner } from '@/components/ui'
// import LanguageToggle from '@/components/ui/LanguageToggle/LanguageToggle'

import styles from './Navbar.module.css'

export function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()

    const { isLogged, getUser } = useAuthStore()
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userDetails, setUserDetails] = useState<UserDetails | undefined>(undefined)
    const [profileLoading, setProfileLoading] = useState(false)
    const [hidden, setHidden] = useState(false)
    const [transparent, setTransparent] = useState(false)
    const [lastScrollY, setLastScrollY] = useState(0)
    
    useEffect(() => {
        if (isLogged) {
            // Simulate loading state for better UX
            setProfileLoading(true)
            setTimeout(() => {
                const userData = getUser()
                setUserDetails(userData ?? undefined)
                setProfileLoading(false)
            }, 500)
        }
    }, [isLogged, getUser])
    
    // Handle scroll to hide/show navbar
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const scrollingDown = currentScrollY > lastScrollY
            const pastThreshold = currentScrollY > 100
            
            if (scrollingDown && pastThreshold) {
                // Scrolling down - hide navbar
                setHidden(true)
                setTransparent(false)
            } else if (!scrollingDown && pastThreshold) {
                // Scrolling up - show transparent navbar
                setHidden(false)
                setTransparent(true)
            } else {
                // At top - show solid navbar
                setHidden(false)
                setTransparent(false)
            }
            
            setLastScrollY(currentScrollY)
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY])

    const isActive = (path: string) => location.pathname.startsWith(path)

    const navItems = [
        { path: ROUTES.home, icon: RiHome3Line, label: 'Home' },
    ]

    const toggleMobileMenu = () => {
        setMobileMenuOpen(prev => !prev)
    }

    const navbarClasses = [
        styles.navbar,
        hidden ? styles.hidden : '',
        transparent ? styles.transparent : '',
    ].filter(Boolean).join(' ')

    return (
        <nav className={navbarClasses}>
            
            {/* Main logo */}
            <Link to={ROUTES.home} className={styles.logo}>
                <img src={LOGO.src} alt={LOGO.alt} className={styles.logoImg} />
                <span className={styles.logoText}>{PROJECT_NAME}</span>
            </Link>

            {/* MOBILE: menu toggle */}
            <button className={styles.mobileToggle} onClick={toggleMobileMenu}>
                {mobileMenuOpen ? (
                    <RiCloseLine size={24} className="fade-in" />
                ) : (
                    <RiMenuLine size={24} className="fade-in" />
                )}
            </button>
            
            {/* DESKTOP: menu links */}
            <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <item.icon className={styles.icon} />
                        <span className={styles.linkText}>{item.label}</span>
                        {isActive(item.path) && <span className={styles.activeIndicator}></span>}
                    </Link>
                ))}
                
                {isLogged && mobileMenuOpen ? (
                    <Link 
                        to="/profile"
                        className={`${styles.navLink} ${isActive('/profile') ? styles.active : ''} ${styles.showWhenSmall}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <RiUserLine className={styles.icon} />
                        <span>Profile</span>
                    </Link>
                ) : (
                    <Button 
                        variant="primary"
                        size="sm"
                        className={styles.showWhenSmall}
                        onClick={() => navigate(ROUTES.login)}
                    >
                        Login
                    </Button>
                )}
                
            </div>
            
            {/* User actions */}
            <div className={styles.actions}>
                {profileLoading ? (
                    <div className={`${styles.userInfo} fade-in`}>
                        <Spinner className={styles.user} />
                    </div>
                ) : isLogged ? (
                    <div className={`${styles.userInfo} fade-in`}>
                        <Link to="/profile" className={`${styles.user} transform-3d`}>
                            <div className={styles.userAvatar}>
                                <span className="avatar-text">{userDetails?.username?.charAt(0).toUpperCase() || 'U'}</span>
                                <div className="avatar-shine"></div>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className={`${styles.authActions} fade-in`}>
                        <Button 
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(ROUTES.login)}
                        >
                            Login
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    )
}
