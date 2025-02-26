import Home from './components/Home'
import Login from './components/Login'
import OTP from './components/OTP'
import AddCard from './components/AddCard'
import CardList from './components/CardList'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/otp" element={<OTP />} />
                <Route path="/add-card" element={<AddCard />} />
                <Route path="/my-cards" element={<CardList />} />
            </Routes>
        </Router>
    )
}

export default App
