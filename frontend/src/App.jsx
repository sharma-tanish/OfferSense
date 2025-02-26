import Home from './components/Home'
import Login from './components/Login'
import OTP from './components/OTP'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/otp" element={<OTP />} />
            </Routes>
        </Router>
    )
}

export default App
