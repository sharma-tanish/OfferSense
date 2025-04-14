import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import OTP from './components/OTP'
import MyCards from './components/MyCards'
import AddCard from './components/AddCard'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const isVerified = localStorage.getItem('isVerified') === 'true'
    
    if (!isVerified) {
        return <Navigate to="/" replace />
    }
    
    return children
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/otp" element={<OTP />} />
                <Route 
                    path="/my-cards" 
                    element={
                        <ProtectedRoute>
                            <MyCards />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/add-card" 
                    element={
                        <ProtectedRoute>
                            <AddCard />
                        </ProtectedRoute>
                    } 
                />
                {/* Redirect /dashboard to /my-cards */}
                <Route path="/dashboard" element={<Navigate to="/my-cards" replace />} />
                {/* Catch all other routes and redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    )
}

export default App
