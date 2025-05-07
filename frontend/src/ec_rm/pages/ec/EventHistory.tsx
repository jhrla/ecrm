import React from 'react';
import { Outlet } from 'react-router-dom';

export const EventHistory: React.FC = () => {
  return (
    <div>
      <Outlet /> {/* 하위 컴포넌트가 여기에 렌더링됩니다 */}
    </div>
  );
};
