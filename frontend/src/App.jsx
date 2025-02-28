import Home from './components/Home'
import Login from './components/Login'
import OTP from './components/OTP'
import MyCards from './components/MyCards'
import AddCard from './components/AddCard'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/otp" element={<OTP />} />
                <Route path="/my-cards" element={<MyCards />} />
                <Route path="/add-card" element={<AddCard />} />
            </Routes>
        </Router>
    )
}

export default App
