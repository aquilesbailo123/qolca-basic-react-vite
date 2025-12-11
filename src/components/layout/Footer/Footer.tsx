import { Link } from 'react-router-dom'
import { 
    RiFacebookFill,
    RiInstagramFill,
    RiLinkedinFill,
    RiGlobalLine,
} from 'react-icons/ri'

import { ROUTES } from '@/constants/routes'
import { PROJECT_NAME } from '@/constants/common'

import styles from './Footer.module.css'

export function Footer() {
    const currentYear = new Date().getFullYear()
    
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.branding}>
                    <Link to={ROUTES.home} className={styles.logo}>
                        <span className={styles.logoText}>{PROJECT_NAME}</span>
                    </Link>
                    <p className={styles.tagline}>React-Vite Project Template</p>
                </div>

                <div className={styles.links}>
                    <h4>Navigation</h4>
                    <ul>
                        <li><Link to={ROUTES.home}>Home</Link></li>
                    </ul>
                </div>

                <div className={styles.social}>
                    <h4>Community</h4>
                    <div className={styles.socialIcons}>
                        <a href="https://www.facebook.com/profile.php?id=61559863243995" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                            <RiFacebookFill size={20} />
                        </a>
                        <a href="https://www.instagram.com/qolca.peru/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                            <RiInstagramFill size={20} />
                        </a>
                        <a href="https://www.linkedin.com/in/qolca-solutions/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                            <RiLinkedinFill size={20} />
                        </a>
                        <a href="https://qolca.org" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                            <RiGlobalLine size={20} />
                        </a>
                    </div>
                </div>
            </div>

            <div className={styles.bottom}>
                <p className={styles.copyright}>
                    {`© ${currentYear} - All rights reserved`}
                </p>
                <p className={styles.madeWith}>
                    Made by qolca
                </p>
            </div>
        </footer>
    )
}

