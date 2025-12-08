import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapView({ center = [-1.2921, 36.8219], markers = [], zoom = 13 }) {
  useEffect(() => {
    const map = L.map('map').setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Add markers
    markers.forEach(marker => {
      L.marker(marker.position)
        .addTo(map)
        .bindPopup(marker.popup || 'Location')
    })

    // Add current location marker
    const currentLocationMarker = L.marker(center)
      .addTo(map)
      .bindPopup('Current Location')
      .openPopup()

    // Fit bounds if we have multiple markers
    if (markers.length > 0) {
      const bounds = L.latLngBounds([center, ...markers.map(m => m.position)])
      map.fitBounds(bounds)
    }

    return () => {
      map.remove()
    }
  }, [center, markers, zoom])

  return <div id="map" className="h-96 w-full rounded-lg" />
}