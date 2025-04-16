import { useRef } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import '~/leaflet.css';
import type { Earthquake } from '~/types/earthquake';

interface WorldMapViewProps {
  earthquakes: Earthquake[];
  bounds?: [[number, number], [number, number]]; // [[lat1, lon1], [lat2, lon2]]
}

export default function WorldMapView({ earthquakes, bounds }: WorldMapViewProps) {
  const mapRef = useRef(null);

  const getExpandedBounds = () => {
    if (!bounds)
      return [
        [-90, -180],
        [90, 180],
      ] as [[number, number], [number, number]];
    const [[lat1, lon1], [lat2, lon2]] = bounds;
    const latDiff = Math.abs(lat1 - lat2);
    const lonDiff = Math.abs(lon1 - lon2);

    // Add 20% margin to each side
    const latMargin = latDiff * 0.1;
    const lonMargin = lonDiff * 0.1;

    return [
      [Math.min(lat1, lat2) - latMargin, Math.min(lon1, lon2) - lonMargin],
      [Math.max(lat1, lat2) + latMargin, Math.max(lon1, lon2) + lonMargin],
    ] as [[number, number], [number, number]];
  };

  const getBoundsZoom = () => {
    if (!bounds) return 2;
    const [[lat1, lon1], [lat2, lon2]] = bounds;
    const latDiff = Math.abs(lat1 - lat2);
    const lonDiff = Math.abs(lon1 - lon2);
    const maxDiff = Math.max(latDiff, lonDiff);

    // Smaller differences = more zoom
    if (maxDiff < 5) return 8;
    if (maxDiff < 10) return 7;
    if (maxDiff < 20) return 6;
    if (maxDiff < 40) return 5;
    if (maxDiff < 60) return 4;
    return 3;
  };

  const isWithinBounds = (lat: number, lon: number) => {
    if (!bounds) return true;
    const expandedBounds = getExpandedBounds();
    if (!expandedBounds) return true;

    const [[minLat, minLon], [maxLat, maxLon]] = expandedBounds;
    return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
  };

  // Function to determine circle size based on magnitude
  const getCircleRadius = (magnitude: number) => {
    // Base size for small earthquakes
    const baseSize = 1.2;

    // Exponential scaling for better visibility
    return baseSize * magnitude * getBoundsZoom();
  };

  // Function to determine circle color based on recency
  const getCircleColor = (timestamp: string) => {
    const quakeTime = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const hoursDiff = (now - quakeTime) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
      return '#FF2B2B'; // Vibrant red for very recent
    } else if (hoursDiff < 2) {
      return '#FF6B3D'; // Coral orange for recent
    } else if (hoursDiff < 4) {
      return '#FFA041'; // Bright orange for somewhat recent
    } else if (hoursDiff < 8) {
      return '#FFD449'; // Golden yellow for older
    } else {
      return '#B4FF4A'; // Lime green for oldest
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

  // Filter and sort earthquakes
  const filteredAndSortedEarthquakes = [...earthquakes].filter((eq) => isWithinBounds(eq.latitude, eq.longitude)).sort((a, b) => b.magnitude - a.magnitude);

  // Calculate center and zoom if bounds provided
  const mapCenter = bounds ? [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2] : [0, 0];
  console.log({ mapCenter });
  return (
    <div className='w-full h-full'>
      <MapContainer
        center={mapCenter as [number, number]}
        zoom={getBoundsZoom()}
        maxBounds={getExpandedBounds()}
        minZoom={2}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        {/* Base water layer - lighter */}
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {/* {bounds && (
          <>
            <CircleMarker center={bounds[0] as [number, number]} radius={30} color='#FFFFFF' weight={1} opacity={1}></CircleMarker>
            <CircleMarker center={bounds[1] as [number, number]} radius={30} color='#FFFFFF' weight={1} opacity={1}></CircleMarker>
          </>
        )} */}
        {/* <CircleMarker center={mapCenter as [number, number]} radius={30} color='#FFFFFF' weight={1} opacity={1}></CircleMarker> */}

        {filteredAndSortedEarthquakes.map((earthquake) => (
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
