
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CaptainLogout = () => {
    const token = localStorage.getItem('token') // ✅ fixed token key
    const navigate = useNavigate()

    // ✅ wrapped in useEffect
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, { // ✅ fixed env var
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            if (response.status === 200) {
                localStorage.removeItem('token')
                navigate('/captain-login')
            }
        }).catch((err) => {
            console.error('Logout error:', err.message)
            localStorage.removeItem('token')
            navigate('/captain-login')
        })
    }, [])

    return (
        <div>Logging out...</div>
    )
}

export default CaptainLogout