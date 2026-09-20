import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import SiteNavbar from './components/SiteNavbar'
import SiteFooter from './components/SiteFooter'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const LearningPathPage = lazy(() => import('./pages/LearningPathPage'))
const UnitLessonPage = lazy(() => import('./pages/UnitLessonPage'))
const GamesPage = lazy(() => import('./pages/GamesPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))

function PageLoading() {
    return (
        <div className="neo-page-loader" role="status" aria-label="Loading page">
            <div className="neo-loader-mark" aria-hidden="true">
                <span className="neo-loader-ring neo-loader-ring-one" />
                <span className="neo-loader-ring neo-loader-ring-two" />
                <span className="neo-loader-orbit neo-loader-orbit-one" />
                <span className="neo-loader-orbit neo-loader-orbit-two" />
                <span className="neo-loader-core">N</span>
            </div>
            <strong className="neo-loader-wordmark">NeoLit</strong>
            <div className="neo-loader-dots" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
        </div>
    )
}

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <PageLoading />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role === 'admin') {
        return <Navigate to="/admin" replace />
    }

    return (
        <>
            <SiteNavbar />
            {children}
            <SiteFooter />
        </>
    )
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <PageLoading />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== 'admin') {
        return <Navigate to="/learning-path" replace />
    }

    return <>{children}</>
}

function RootRedirect() {
    const { user, loading } = useAuth()

    if (loading) {
        return <PageLoading />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Navigate to={user.role === 'admin' ? '/admin' : '/learning-path'} replace />
}

function AppRoutes() {
    return (
        <Suspense fallback={<PageLoading />}>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login/admin" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register/admin" element={<RegisterPage adminMode />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/learning-path"
                    element={
                        <ProtectedRoute>
                            <LearningPathPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/lesson/:unit"
                    element={
                        <ProtectedRoute>
                            <UnitLessonPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/games"
                    element={
                        <ProtectedRoute>
                            <GamesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboardPage />
                        </AdminRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/learning-path" replace />} />
            </Routes>
        </Suspense>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}
