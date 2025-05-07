import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useSearchBar } from '../../../contexts/SearchProvider';
import EventList from 'ec_rm/pages/ec/event/EventList';
import EventEtcList from 'ec_rm/pages/ec/event/EventEtcList';
import FaultList from 'ec_rm/pages/ec/fault/FaultList';
import Dashboard from 'ec_rm/pages/ec/dashboard/Dashboard';

interface MainContentProps {
  activeTopMenu: string;
  activeLeftMenu: string;
  activeLeftMenuNm: string;
  setActiveLeftMenu?: (menu: string) => void;
}

// MainContent 컴포넌트
const MainContent: React.FC<MainContentProps> = ({
  activeTopMenu,
  activeLeftMenu,
  activeLeftMenuNm,
  setActiveLeftMenu,
}) => {
  const location = useLocation();
  const { isSearchVisible, toggleSearch } = useSearchBar();

  // 현재 경로에 따라 컴포넌트 결정
  const renderContent = () => {
    const path = location.pathname;
    console.log('Rendering content for path:', path);

    if (path.includes('dashboard')) {
      return <Dashboard />;
    }
    if (path.includes('event-history')) {
      return <EventList />;
    }
    if (path.includes('event-etc-history')) {
      return <EventEtcList />;
    }
    if (path.includes('fault-history')) {
      return <FaultList />;
    }
    return null;
  };

  return (
    <div className='contents col'>
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
      <div
        className={`${location.pathname.includes('dashboard') ? '' : 'page_cont_area'}`}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContent;
