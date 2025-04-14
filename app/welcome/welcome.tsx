'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Dashboard from '~/components/dashboard';

export default function Welcome() {
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000');
      setEarthquakeData(response.data);
      setLoading(false);
    } catch (err) {
      setError(err as any);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up polling every minute
    const intervalId = setInterval(fetchData, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen w-screen bg-gray-900 text-white'>
        <div className='text-2xl'>Loading earthquake data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-screen w-screen bg-gray-900 text-white'>
        <div className='text-2xl'>Error loading earthquake data. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className='w-[1920px] h-[1080px] overflow-hidden bg-gray-900'>
      <Dashboard earthquakeData={earthquakeData} />
    </div>
  );
}
