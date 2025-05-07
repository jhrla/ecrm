import React, { useEffect, useState } from 'react';
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useSearchBar } from '../../../contexts/SearchProvider';
import classNames from 'classnames';

// 하위 메뉴 컴포넌트들
import { CustomerManagement } from '../../../pages/rm/customer/CustomerManagement';
import FloorPlan from '../../../pages/rm/device/FloorPlan';
import FloorInfoRegist from '../../../pages/rm/device/FloorInfoRegist';
import DeviceSetup from '../../../pages/rm/device/DeviceSetup';
import FloorInfo from '../../../pages/rm/device/FloorInfo';
import PeriodicReport from '../../../pages/rm/statistics/PeriodicReport';

interface MainContentProps {
  activeTopMenu: string;
  activeLeftMenu: string;
  activeLeftMenuNm: string;
}

export const MainContent = ({
  activeTopMenu,
  activeLeftMenu,
  activeLeftMenuNm,
}: MainContentProps): JSX.Element => {
  const location = useLocation();
  const { isSearchVisible, toggleSearch } = useSearchBar();

  const isBlack = location.pathname.includes('/floor-plan');
  const contentClass = classNames('contents', 'col', {
    black: isBlack,
  });

  return (
    <div className={contentClass}>
      <div className='page_title_area'>
        <div className='inner d-flex align-items-center justify-content-between'>
          <h2 className='flex-shrink-0'>{activeLeftMenuNm}</h2>
          <div className='page_title_info d-flex align-items-center'>
            <button
              className='btn mo-search-btn search_close'
              onClick={toggleSearch}
            >
              <span>{isSearchVisible ? '검색닫기' : '검색열기'}</span>
              <i className={`ti-angle-${isSearchVisible ? 'up' : 'down'}`}></i>
            </button>
          </div>
        </div>
      </div>
      <div className='page_cont_area'>
        <Routes>
          <Route
            path='customer-info/management'
            element={<CustomerManagement />}
          />
          <Route
            path='device-info/device-quantity'
            element={<FloorInfoRegist />}
          />
          <Route path='device-info/floor-device' element={<FloorInfo />} />
          <Route path='device-info/floor-plan' element={<FloorPlan />} />
          <Route path='device-info/device-setup' element={<DeviceSetup />} />
          <Route
            path='statistics/periodic-report'
            element={<PeriodicReport />}
          />
          <Route
            path='*'
            element={<Navigate to='customer-info/management' replace />}
          />
        </Routes>
      </div>
    </div>
  );
};
