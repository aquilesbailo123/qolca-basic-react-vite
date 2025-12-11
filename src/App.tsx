import { Routes, Route } from "react-router-dom"
import { Toaster, ToastBar, toast } from "react-hot-toast"

import { ROUTES } from "./constants"
import { useScrollToTop } from "./hooks"

// Layout
import { Main } from "./pages/Main/Main"
import { ModalBase } from "./components/modals/ModalBase/ModalBase"

// Public pages
import { Home } from "./pages/Home/Home"
import { NotFound } from "./pages/NotFound/NotFound"

// Protected pages
import { Profile } from "./pages/Profile/Profile"
import { ProtectedRoute } from "./components/features/ProtectedRoute/ProtectedRoute"

// Auth pages
import { Login } from "./pages/auth/Login/Login"
import { Register } from "./pages/auth/Register/Register"
import { VerifyEmail } from "./pages/auth/VerifyEmail/VerifyEmail"
import { ForgotPassword } from "./pages/auth/ForgotPassword/ForgotPassword"
import { ChangePassword } from "./pages/auth/ChangePassword/ChangePassword"

import './App.css'

function App() {
    // The new AuthStore no longer needs initialization as it
    // checks token validity on creation
    useScrollToTop();

    return (
        <div className="App">
            <ModalBase />
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 5000,
                    success: { className: "toast-success" },
                    error: { className: "toast-error" },
                    style: {
                        zIndex: 20
                    }
                }}
                children={(toasts) => (
                    <ToastBar toast={toasts}>
                        {({ icon, message }) => (
                            <div
                              onClick={() => toast.dismiss()}
                              style={{ cursor: "pointer", display: "flex"}}
                            >
                                {icon}
                                {message}
                            </div>
                        )}
                    </ToastBar>
                )}
            />
            <Routes>
                {/* Public auth endpoints */}
                <Route path={ROUTES.login} element={<Login />} />
                <Route path={ROUTES.register} element={<Register />} />
                <Route path={ROUTES.verifyEmail} element={<VerifyEmail />} />
                <Route path={ROUTES.forgotPassword} element={<ForgotPassword />} />
                
                {/* Protected auth endpoints */}
                <Route element={<ProtectedRoute redirectToLogin />}>
                    <Route path={ROUTES.changePassword} element={<ChangePassword />} />
                </Route>

                <Route path={ROUTES.main} element={<Main />}>
                    {/* Public routes */}
                    <Route path={ROUTES.home} element={<Home />} />
                    
                    {/* Protected routes - require authentication */}
                    <Route element={<ProtectedRoute />}>
                        <Route path={ROUTES.profile} element={<Profile />} />
                        {/* Add more protected routes here */}
                    </Route>
                </Route>
                <Route path={ROUTES.notFound} element={<NotFound />} />
            </Routes>
        </div>
    )
}

export { App }
