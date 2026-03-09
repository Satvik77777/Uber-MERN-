const axios = require('axios');
const captainModel = require('../models/captain.model');

module.exports.getAddressCoordinate = async (address) => {
    const apiKey = process.env.MAPTILER_KEY;
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${apiKey}`;

    try {
        const response = await axios.get(url);

        if (response.data.features.length > 0) {
            const location = response.data.features[0].center;
            return {
                ltd: location[1],
                lng: location[0]
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error('getAddressCoordinate error:', error.message);
        throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {
        const originCoords = await module.exports.getAddressCoordinate(origin);
        const destCoords = await module.exports.getAddressCoordinate(destination);

        const url = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.ltd};${destCoords.lng},${destCoords.ltd}?overview=false`;

        const response = await axios.get(url);
        const route = response.data.routes[0];

        return {
            distance: {
                text: `${(route.distance / 1000).toFixed(2)} km`,
                value: route.distance
            },
            duration: {
                text: `${Math.round(route.duration / 60)} mins`,
                value: route.duration
            }
        };
    } catch (err) {
        console.error('getDistanceTime error:', err.message);
        throw err;
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    const apiKey = process.env.MAPTILER_KEY;
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(input)}.json?autocomplete=true&limit=5&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        return response.data.features.map(place =>
            place.place_name || place.properties?.name || place.text || 'Unknown place'
        );
    } catch (err) {
        console.error('getAutoCompleteSuggestions error:', err.message);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    console.log('Searching for captains near:', ltd, lng, 'radius:', radius)

    // ✅ fetch all captains with location and filter by distance using Haversine formula
    const captains = await captainModel.find({
        'location.ltd': { $exists: true, $ne: null },
        'location.lng': { $exists: true, $ne: null }
    });

    console.log('Total captains with location:', captains.length)

    const toRad = (value) => (value * Math.PI) / 180

    const nearByCaptains = captains.filter(captain => {
        const dLat = toRad(captain.location.ltd - ltd)
        const dLng = toRad(captain.location.lng - lng)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(ltd)) * Math.cos(toRad(captain.location.ltd)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = 6371 * c

        console.log(`Captain ${captain._id} distance: ${distance.toFixed(2)} km`)
        return distance <= radius
    })

    console.log('Nearby captains found:', nearByCaptains.length)
    return nearByCaptains
}