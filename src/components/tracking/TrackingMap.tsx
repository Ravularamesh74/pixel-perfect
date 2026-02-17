import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import io from 'socket.io-client';

// Keep mapbox token here or use env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.public_test_token';

interface VehicleLocation {
    lat: number;
    lng: number;
    heading: number;
    speed: number;
    vehicleId: string;
}

interface TrackingMapProps {
    vehicleId?: string; // If provided, tracks specific vehicle
    initialLocation?: [number, number];
}

const SOCKET_URL = 'http://localhost:5000';

export default function TrackingMap({ vehicleId }: TrackingMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const socket = useRef<any>(null);
    const [status, setStatus] = useState('Connecting...');

    useEffect(() => {
        if (map.current) return; // initialize map only once

        if (!mapboxgl.accessToken) {
            setStatus('Mapbox token missing');
            return;
        }

        map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [77.5946, 12.9716], // Default to Bangalore
            zoom: 12,
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Connect Socket
        socket.current = io(SOCKET_URL, {
            auth: {
                token: localStorage.getItem('accessToken'),
            },
        });

        socket.current.on('connect', () => {
            setStatus('Connected to live tracking');
            if (vehicleId) {
                socket.current.emit('subscribe_vehicle', vehicleId);
            }
        });

        socket.current.on('disconnect', () => {
            setStatus('Reconnecting...');
        });

        socket.current.on('location-update', (data: VehicleLocation) => {
            if (vehicleId && data.vehicleId !== vehicleId) return;

            // Update Map center
            map.current?.flyTo({
                center: [data.lng, data.lat],
                zoom: 15,
                speed: 0.5,
            });

            // Update Marker
            if (!marker.current) {
                const el = document.createElement('div');
                el.className = 'marker';
                el.style.backgroundImage = 'url(/car-marker.png)'; // Need to add this asset or use default
                el.style.width = '40px';
                el.style.height = '40px';
                el.style.backgroundSize = '100%';

                marker.current = new mapboxgl.Marker({ color: '#FF0000' })
                    .setLngLat([data.lng, data.lat])
                    .addTo(map.current!);
            } else {
                marker.current.setLngLat([data.lng, data.lat]);
            }

            // Should also rotate marker based on heading if using custom element
            // marker.current.setRotation(data.heading);
        });

        return () => {
            socket.current?.disconnect();
            map.current?.remove();
        };
    }, [vehicleId]);

    return (
        <div className="relative w-full h-[500px] rounded-lg overflow-hidden border">
            <div ref={mapContainer} className="w-full h-full" />
            <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-md shadow-md text-sm font-medium z-10">
                Status: <span className={status === 'Connected to live tracking' ? 'text-green-600' : 'text-amber-600'}>{status}</span>
            </div>
        </div>
    );
}
