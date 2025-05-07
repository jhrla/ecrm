import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RefreshRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (location.pathname.startsWith('/rm')) {
        sessionStorage.setItem('rmLastPath', location.pathname);
      } else if (location.pathname.startsWith('/ec')) {
        sessionStorage.setItem('ecLastPath', location.pathname);
      }
    };

    const handleLoad = () => {
      if (location.pathname.startsWith('/rm')) {
        const lastPath = sessionStorage.getItem('rmLastPath');
        if (lastPath) {
          sessionStorage.removeItem('rmLastPath');
          navigate(lastPath, { replace: true });
        }
      } else if (location.pathname.startsWith('/ec')) {
        const lastPath = sessionStorage.getItem('ecLastPath');
        if (lastPath) {
          sessionStorage.removeItem('ecLastPath');
          navigate(lastPath, { replace: true });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, [navigate, location]);

  return null;
};

export default RefreshRedirect;
