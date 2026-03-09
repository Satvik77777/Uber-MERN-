import React, { useState, useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const LiveTracking = () => {
    const mapContainer = useRef(null)
    const map = useRef(null)
    const marker = useRef(null)
    const [ currentPosition, setCurrentPosition ] = useState({
        lat: -3.745,
        lng: -38.523
    })

    // Initialize map
    useEffect(() => {
        if (map.current) return // only initialize once

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
            center: [ currentPosition.lng, currentPosition.lat ],
            zoom: 15
        })

        // Add navigation controls
        map.current.addControl(new maplibregl.NavigationControl())

        // Add marker
        marker.current = new maplibregl.Marker({ color: '#000000' })
            .setLngLat([ currentPosition.lng, currentPosition.lat ])
            .addTo(map.current)

    }, [])

    // Watch user position
    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords
            setCurrentPosition({ lat: latitude, lng: longitude })

            // Move marker and map center
            if (map.current && marker.current) {
                marker.current.setLngLat([ longitude, latitude ])
                map.current.flyTo({ center: [ longitude, latitude ] })
            }
        })

        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    return (
        <div
            ref={mapContainer}
            style={{ width: '100%', height: '100%' }}
        />
    )
}

export default LiveTracking