import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Sessions from './pages/Sessions';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, token } = useAuthStore();

    if (!token || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

// Public Route wrapper (redirect to home if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, token } = useAuthStore();

    if (token && isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                } />

                {/* Protected routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/clients" element={
                    <ProtectedRoute>
                        <Layout>
                            <Clients />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/clients/:id" element={
                    <ProtectedRoute>
                        <Layout>
                            <ClientDetail />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/sessions" element={
                    <ProtectedRoute>
                        <Layout>
                            <Sessions />
                        </Layout>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;
