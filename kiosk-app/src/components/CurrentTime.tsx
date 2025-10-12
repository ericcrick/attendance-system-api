// //src/components/CurrentTime.tsx

// 'use client';

// import { useState, useEffect } from 'react';

// export default function CurrentTime() {
//   const [time, setTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTime(new Date());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: true,
//     });
//   };

//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   return (
//     <div className="text-right">
//       <div className="text-base font-semibold text-gray-900 tabular-nums">
//         {formatTime(time)}
//       </div>
//       <div className="text-xs text-gray-500">
//         {formatDate(time)}
//       </div>
//     </div>
//   );
// }



//src/components/CurrentTime.tsx
'use client';

import { useState, useEffect } from 'react';

export default function CurrentTime() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client mount
    setTime(new Date());
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show placeholder until client-side mount
  if (!time) {
    return (
      <div className="text-right">
        <div className="text-base font-semibold text-gray-900 tabular-nums">
          --:--:-- --
        </div>
        <div className="text-xs text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="text-right">
      <div className="text-base font-semibold text-gray-900 tabular-nums">
        {formatTime(time)}
      </div>
      <div className="text-xs text-gray-500">
        {formatDate(time)}
      </div>
    </div>
  );
}