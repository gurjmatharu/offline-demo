// useNetworkStatus.js
import { useState, useEffect } from "react";

const useNetworkStatus = () => {
  // Initial state considers both online status and connection type
  const isConnected = () => navigator.onLine && navigator.connection?.effectiveType.includes('4g');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? isConnected() : true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(isConnected());

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    // Consider changes in connection type as well
    navigator.connection?.addEventListener('change', updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      navigator.connection?.removeEventListener('change', updateOnlineStatus);
    };
  }, []);

  return [isOnline, setIsOnline]; 
};

export default useNetworkStatus;
