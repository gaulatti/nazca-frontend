import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import DetailView from '~/components/detail-view';
import Marquee from '~/components/marquee';
import WorldMapView from '~/components/world-map-view';
import type { Earthquake } from '~/types/earthquake';

interface DashboardProps {
  earthquakeData: Earthquake[];
}

export default function Dashboard({ earthquakeData }: DashboardProps) {
  const [currentView, setCurrentView] = useState<'world' | 'regional' | 'detail'>('world');
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [currentGroup, setCurrentGroup] = useState(0);

  // Filter earthquakes with magnitude >= 5
  const significantEarthquakes = earthquakeData
    .filter((quake) => quake.magnitude >= 5)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Group significant earthquakes into groups of 4
  const groupedSignificantEarthquakes = [];
  for (let i = 0; i < significantEarthquakes.length; i += 4) {
    groupedSignificantEarthquakes.push(significantEarthquakes.slice(i, i + 4));
  }

  // Calculate the current earthquake to display in detail view
  const currentGroupEarthquakes = groupedSignificantEarthquakes[currentGroup] || [];
  const currentEarthquake = currentGroupEarthquakes[currentDetailIndex];

  // South America bounds
  const REGIONAL_BOUNDS = [[-12.930675, -111.720448], [-56.557609, -63.674670]] as [[number, number], [number, number]];

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (currentView === 'world') {
      timer = setTimeout(() => {
        setCurrentView('regional');
      }, 15000);
    } else if (currentView === 'regional') {
      timer = setTimeout(() => {
        if (significantEarthquakes.length > 0) {
          setCurrentView('detail');
          setCurrentDetailIndex(0);
        } else {
          setCurrentView('world');
        }
      }, 15000);
    } else if (currentView === 'detail') {
      timer = setTimeout(() => {
        if (currentDetailIndex < currentGroupEarthquakes.length - 1) {
          setCurrentDetailIndex(currentDetailIndex + 1);
        } else {
          if (currentGroup < groupedSignificantEarthquakes.length - 1) {
            setCurrentView('world');
            setCurrentGroup(currentGroup + 1);
          } else {
            setCurrentView('world');
            setCurrentGroup(0);
          }
        }
      }, 15000);
    }

    return () => clearTimeout(timer);
  }, [currentView, currentDetailIndex, currentGroup, currentGroupEarthquakes.length, groupedSignificantEarthquakes.length, significantEarthquakes.length]);

  return (
    <div className='relative w-full h-full bg-gray-900 text-white'>
      <AnimatePresence mode='wait'>
        {currentView === 'world' && (
          <motion.div
            key='world-view'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className='w-full h-[calc(100%-50px)]'
          >
            <WorldMapView earthquakes={earthquakeData} />
          </motion.div>
        )}
        {currentView === 'regional' && (
          <motion.div
            key='regional-view'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className='w-full h-[calc(100%-50px)]'
          >
            <WorldMapView earthquakes={earthquakeData} bounds={REGIONAL_BOUNDS} />
          </motion.div>
        )}
        {currentView === 'detail' && (
          <motion.div
            key={`detail-view-${currentEarthquake?.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className='w-full h-[calc(100%-50px)]'
          >
            {currentEarthquake && <DetailView earthquake={currentEarthquake} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lower thirds marquee */}
      <div className='absolute bottom-0 left-0 w-full z-10'>
        <Marquee earthquakes={earthquakeData} />
      </div>
    </div>
  );
}
