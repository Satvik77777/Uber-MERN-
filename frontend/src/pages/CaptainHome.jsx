import React, { useRef, useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CapatainContext'
import LiveTracking from '../components/LiveTracking'
import axios from 'axios'

const CaptainHome = () => {
    const [ ridePopupPanel, setRidePopupPanel ] = useState(false)
    const [ confirmRidePopupPanel, setConfirmRidePopupPanel ] = useState(false)
    const ridePopupPanelRef = useRef(null)
    const confirmRidePopupPanelRef = useRef(null)
    const [ ride, setRide ] = useState(null)

    const { socket } = useContext(SocketContext)
    const { captain } = useContext(CaptainDataContext)
    const navigate = useNavigate()

    useEffect(() => {
        socket.emit('join', {
            userId: captain._id,
            userType: 'captain'
        })

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    socket.emit('update-location-captain', {
                        userId: captain._id,
                        location: {
                            ltd: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    })
                })
            }
        }

        const locationInterval = setInterval(updateLocation, 10000)
        updateLocation()

        return () => clearInterval(locationInterval)
    }, [])

    useEffect(() => {
        socket.on('new-ride', (data) => {
            setRide(data)
            setRidePopupPanel(true)
        })

        return () => socket.off('new-ride')
    }, [ socket ])

    async function confirmRide() {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
            rideId: ride._id,
            captainId: captain._id,
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        setRidePopupPanel(false)
        setConfirmRidePopupPanel(true)
    }

    async function handleLogout() {
        try {
            await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
        } catch (err) {
            console.error('Logout error:', err.message)
        } finally {
            localStorage.removeItem('token')
            navigate('/captain-login')
        }
    }

    useGSAP(function () {
        if (ridePopupPanel) {
            gsap.to(ridePopupPanelRef.current, { transform: 'translateY(0)' })
        } else {
            gsap.to(ridePopupPanelRef.current, { transform: 'translateY(100%)' })
        }
    }, [ ridePopupPanel ])

    useGSAP(function () {
        if (confirmRidePopupPanel) {
            gsap.to(confirmRidePopupPanelRef.current, { transform: 'translateY(0)' })
        } else {
            gsap.to(confirmRidePopupPanelRef.current, { transform: 'translateY(100%)' })
        }
    }, [ confirmRidePopupPanel ])

    return (
        <div className='h-screen'>
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-10'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                <button
                    onClick={handleLogout}
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </button>
            </div>

            <div className='h-3/5'>
                <LiveTracking />
            </div>

            <div className='h-2/5 p-6'>
                <CaptainDetails />
            </div>

            <div ref={ridePopupPanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                />
            </div>

           {/* ✅ removed padding from wrapper, moved to inner component */}
<div ref={confirmRidePopupPanelRef} className='fixed w-full h-auto z-10 bottom-0 translate-y-full bg-white'>
    <ConfirmRidePopUp
        ride={ride}
        setConfirmRidePopupPanel={setConfirmRidePopupPanel}
        setRidePopupPanel={setRidePopupPanel}
        confirmRide={confirmRide}
    />
</div>
        </div>
    )
}

export default CaptainHome