import 'leaflet/dist/leaflet.css';
import { useRef } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import type { Earthquake } from '~/types/earthquake';

interface WorldMapViewProps {
  earthquakes: Earthquake[];
}

export default function WorldMapView({ earthquakes }: WorldMapViewProps) {
  const mapRef = useRef(null);

  // Function to determine circle size based on magnitude
  const getCircleRadius = (magnitude: number) => {
    // Base size for small earthquakes
    const baseSize = 4;

    // Exponential scaling for better visibility
    return baseSize * Math.exp(magnitude / 2);
  };

  // Function to determine circle color based on recency
  const getCircleColor = (timestamp: string) => {
    const quakeTime = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const hoursDiff = (now - quakeTime) / (1000 * 60 * 60);

    // Color gradient from red (recent) to yellow (older)
    if (hoursDiff < 1) {
      return '#FF0000'; // Red for very recent (< 1 hour)
    } else if (hoursDiff < 2) {
      return '#FF3300'; // Orange-red for recent (1-2 hours)
    } else if (hoursDiff < 4) {
      return '#FF6600'; // Orange for somewhat recent (2-4 hours)
    } else if (hoursDiff < 8) {
      return '#FF9900'; // Yellow-orange for older (4-8 hours)
    } else {
      return '#FFCC00'; // Yellow for oldest (> 8 hours)
    }
  };

  // Function to determine circle opacity based on recency
  const getCircleOpacity = (timestamp: string) => {
    const quakeTime = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const hoursDiff = (now - quakeTime) / (1000 * 60 * 60);

    // Fade from 1.0 (recent) to 0.6 (older)
    return Math.max(0.6, 1 - hoursDiff / 24);
  };

  // Sort earthquakes by magnitude (largest first) to ensure larger ones don't get hidden
  const sortedEarthquakes = [...earthquakes].sort((a, b) => b.magnitude - a.magnitude);

  return (
    <div className='w-full h-full'>
      <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%', width: '100%' }} zoomControl={false} attributionControl={false} ref={mapRef}>
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {sortedEarthquakes.map((earthquake) => (
          <CircleMarker
            key={earthquake.id}
            center={[earthquake.latitude, earthquake.longitude]}
            radius={getCircleRadius(earthquake.magnitude)}
            fillColor={getCircleColor(earthquake.timestamp)}
            color='#FFFFFF'
            weight={1}
            opacity={0.8}
            fillOpacity={getCircleOpacity(earthquake.timestamp)}
          >
            <Tooltip permanent={earthquake.magnitude >= 5}>
              <div className='text-xs'>
                <div className='font-bold'>M{earthquake.magnitude.toFixed(1)}</div>
                <div>{earthquake.additionalData?.place || earthquake.additionalData?.flynn_region}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
