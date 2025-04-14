import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { motion } from 'framer-motion';
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import type { Earthquake } from '~/types/earthquake';

interface DetailViewProps {
  earthquake: Earthquake;
}

export default function DetailView({ earthquake }: DetailViewProps) {
  const { latitude, longitude, magnitude, depth, timestamp, additionalData } = earthquake;

  // Format date for different timezones
  const formatInTimezone = (date: Date, timeZone: string, formatStr: string) => {
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, formatStr);
  };

  const parsedDate = parseISO(timestamp);

  // Get location name
  const locationName = additionalData?.place || additionalData?.flynn_region || 'Unknown Location';

  // Calculate map zoom level based on magnitude
  const getZoomLevel = () => {
    if (magnitude >= 7) return 4;
    if (magnitude >= 6) return 5;
    if (magnitude >= 5) return 6;
    return 7;
  };

  return (
    <div className='flex w-full h-full'>
      {/* Left side - Map */}
      <div className='w-1/2 h-full'>
        <MapContainer
          center={[latitude, longitude]}
          zoom={getZoomLevel()}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <CircleMarker
            center={[latitude, longitude]}
            radius={Math.max(10, magnitude * 3)}
            fillColor='#FF0000'
            color='#FFFFFF'
            weight={2}
            opacity={1}
            fillOpacity={0.8}
          >
            <Tooltip permanent>
              <div className='font-bold'>M{magnitude.toFixed(1)}</div>
            </Tooltip>
          </CircleMarker>
        </MapContainer>
      </div>

      {/* Right side - Details */}
      <div className='w-1/2 h-full flex items-center justify-center p-8'>
        <motion.div
          className='bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-2xl'
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className='flex items-center mb-6'>
            <div className='w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-4xl font-bold mr-6'>M{magnitude.toFixed(1)}</div>
            <div>
              <h1 className='text-3xl font-bold mb-2'>{locationName}</h1>
              <p className='text-xl text-gray-300'>{format(parsedDate, 'MMMM d, yyyy')}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-6 mb-8'>
            <div>
              <p className='text-gray-400 mb-1'>Depth</p>
              <p className='text-xl font-semibold'>{depth} km</p>
            </div>
            <div>
              <p className='text-gray-400 mb-1'>Coordinates</p>
              <p className='text-xl font-semibold'>
                {latitude.toFixed(3)}, {longitude.toFixed(3)}
              </p>
            </div>
          </div>

          <div className='mb-8'>
            <h2 className='text-xl font-semibold mb-4 text-gray-300'>Time Across Regions</h2>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-gray-700/50 p-4 rounded-lg'>
                <p className='text-gray-400 mb-1'>UTC (GMT)</p>
                <p className='text-xl font-semibold'>{format(parsedDate, 'HH:mm:ss')}</p>
              </div>
              <div className='bg-gray-700/50 p-4 rounded-lg'>
                <p className='text-gray-400 mb-1'>Los Angeles (PST/PDT)</p>
                <p className='text-xl font-semibold'>{formatInTimezone(parsedDate, 'America/Los_Angeles', 'HH:mm:ss')}</p>
              </div>
              <div className='bg-gray-700/50 p-4 rounded-lg'>
                <p className='text-gray-400 mb-1'>New York (EST/EDT)</p>
                <p className='text-xl font-semibold'>{formatInTimezone(parsedDate, 'America/New_York', 'HH:mm:ss')}</p>
              </div>
              <div className='bg-gray-700/50 p-4 rounded-lg'>
                <p className='text-gray-400 mb-1'>Central European (CET/CEST)</p>
                <p className='text-xl font-semibold'>{formatInTimezone(parsedDate, 'Europe/Berlin', 'HH:mm:ss')}</p>
              </div>
            </div>
          </div>

          <div className='bg-red-900/30 border border-red-500/30 p-4 rounded-lg'>
            <h3 className='text-lg font-semibold mb-2 text-red-200'>Magnitude Information</h3>
            <p className='text-gray-300'>
              {magnitude >= 7
                ? 'Major earthquake capable of causing widespread, serious damage.'
                : magnitude >= 6
                ? 'Strong earthquake capable of causing significant damage in populated areas.'
                : magnitude >= 5
                ? 'Moderate earthquake that can cause damage to poorly constructed buildings.'
                : 'Light to moderate earthquake, rarely causes significant damage.'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
