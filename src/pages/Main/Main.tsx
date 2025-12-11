import { 
    Outlet, 
    Navigate, 
    useLocation 
} from "react-router-dom"
import styles from "./Main.module.css"

// import Sidebar from "@/components/layout/Sidebar/Sidebar"
import { Navbar, Footer } from '@/components/layout'

import { ROUTES } from '@/constants/routes'

export function Main() {

    const location = useLocation()

    // NOTE this is for adding conditions like isLogged, isAdmin and Navigate the user to some page

    // Only show the landing page on the exact root URL
    const isLandingPage = location.pathname === "/"

    return (
        <>
            {!isLandingPage ? (
                <div className={styles.container}>
                    {/* <Sidebar /> */}
                    <Navbar/>
                    <div className={styles.contentWrapper}>
                        <Outlet />
                        <Footer />
                    </div>
                </div>
            ) : (
                <Navigate to={ROUTES.home} />
            )}
        </>
    )
}
