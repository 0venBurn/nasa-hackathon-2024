// UserLocation.jsx
import React, { useEffect, useState } from 'react';

const UserLocation = ({ onSubmit }) => {
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                        setLoading(false);
                    },
                    (err) => {
                        setError(err.message);
                        setLoading(false);
                    }
                );
            } else {
                setError('Geolocation is not supported by this browser.');
                setLoading(false);
            }
        };

        getLocation();
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (location.lat && location.lng) {
            onSubmit(location);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {/* <h2>Your Location</h2>
            <p>Latitude: {location.lat}</p>
            <p>Longitude: {location.lng}</p> */}
            <button onClick={handleSubmit}>Use Current Location</button>
        </div>
    );
};

export default UserLocation;
