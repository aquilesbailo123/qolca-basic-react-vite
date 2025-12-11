import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

import { Button } from '@/components/ui'
import styles from './NotFound.module.css'

export function NotFound() {
    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <Button 
                    variant="primary" 
                    onClick={() => navigate(ROUTES.home)}
                >
                    Back to Home
                </Button>
            </div>
        </div>
    )
}

