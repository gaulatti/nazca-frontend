import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import type { Earthquake } from '~/types/earthquake';

interface MarqueeProps {
  earthquakes: Earthquake[];
}

export default function Marquee({ earthquakes }: MarqueeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Manual scrolling animation using requestAnimationFrame
  useEffect(() => {
    if (!scrollRef.current) return;

    let animationId: number;
    let position = 0;

    const scroll = () => {
      if (!scrollRef.current) return;

      position -= 1; // Adjust speed here (smaller = slower)

      // Reset position when content has scrolled completely
      const contentWidth = scrollRef.current.scrollWidth / 2;
      if (Math.abs(position) >= contentWidth) {
        position = 0;
      }

      scrollRef.current.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Sort earthquakes by timestamp (most recent first)
  const sortedEarthquakes = [...earthquakes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Format earthquake data for marquee
  const marqueeItems = sortedEarthquakes.map((quake) => {
    const location = quake.additionalData?.place || quake.additionalData?.flynn_region || 'Unknown Location';
    const magnitude = quake.magnitude.toFixed(1);

    // Color based on magnitude
    let textColor = 'text-white';
    if (quake.magnitude >= 7) textColor = 'text-red-500';
    else if (quake.magnitude >= 6) textColor = 'text-orange-500';
    else if (quake.magnitude >= 5) textColor = 'text-yellow-500';
    else if (quake.magnitude >= 4) textColor = 'text-green-500';

    return (
      <span key={quake.id} className='inline-flex items-center mx-4'>
        <span className={`font-bold ${textColor}`}>M{magnitude}</span>
        <span className='mx-1'>•</span>
        <span>{location}</span>
      </span>
    );
  });

  return (
    <div className='w-full h-[50px] bg-black/80 border-t border-gray-800 flex items-center'>
      {/* Left label */}
      <div className='min-w-[120px] h-full bg-red-700 flex items-center justify-center'>
        <span className='font-bold text-white'>LIVE</span>
      </div>

      {/* Scrolling marquee */}
      <div className='flex-1 overflow-hidden relative'>
        <div ref={scrollRef} className='whitespace-nowrap flex items-center h-full text-lg' style={{ willChange: 'transform' }}>
          {/* Duplicate content to create seamless loop */}
          {marqueeItems}
          {marqueeItems}
        </div>
      </div>

      {/* UTC time display */}
      <div className='min-w-[200px] h-full bg-gray-800 flex items-center justify-center border-l border-gray-700'>
        <div className='text-xl font-mono text-white'>{format(currentTime, 'HH:mm:ss')} UTC</div>
      </div>
    </div>
  );
}
