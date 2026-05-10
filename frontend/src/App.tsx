import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DataCollection from './pages/DataCollection'
import EarlyWarning from './pages/EarlyWarning'
import KnowledgeQA from './pages/KnowledgeQA'
import Profile from './pages/Profile'
import MainLayout from './layouts/MainLayout'

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

    useEffect(() => {
        const checkToken = () => {
            setToken(localStorage.getItem('token'))
        }
        
        const handleStorageChange = () => {
            setToken(localStorage.getItem('token'))
        }
        
        checkToken()
        
        const interval = setInterval(checkToken, 1000)
        
        window.addEventListener('storage', handleStorageChange)
        
        return () => {
            clearInterval(interval)
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    return (
        <BrowserRouter>
            <Routes>
                {!token ? (
                    <>
                        <Route path="/login" element={<Login />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                ) : (
                    <>
                        <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
                        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
                        <Route path="/data-collection" element={<MainLayout><DataCollection /></MainLayout>} />
                        <Route path="/early-warning" element={<MainLayout><EarlyWarning /></MainLayout>} />
                        <Route path="/knowledge-qa" element={<MainLayout><KnowledgeQA /></MainLayout>} />
                        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </>
                )}
            </Routes>
        </BrowserRouter>
    )
}

export default App