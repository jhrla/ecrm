import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Header } from '../components/layout/ec/Header';
import { Left } from '../components/layout/ec/Left';
import { Footer } from '../components/layout/Footer';
import { SearchBarProvider } from '../contexts/SearchProvider';

import MainContent from 'ec_rm/components/layout/ec/MainContent';

interface SubMenu {
  name: string;
  url: string;
}

interface MenuItem {
  name: string;
  url: string;
  subMenus: SubMenu[];
}

const EcMain: React.FC = () => {
  const [key, setKey] = useState(0);
  const [activeTopMenu, setActiveTopMenu] = useState('dashboard');
  const [activeLeftMenu, setActiveLeftMenu] = useState('');
  const [activeLeftMenuNm, setActiveLeftMenuNm] = useState('');
  const [dashboardState, setDashboardState] = useState<any>({});
  const navigate = useNavigate();
  const location = useLocation();

  const prevPath = React.useRef(location.pathname);

  const topMenuItems = useMemo(
    () => [
      {
        name: '현황판',
        url: 'dashboard',
        subMenus: [],
      },
      {
        name: '이벤트이력',
        url: 'event-management',
        subMenus: [
          { name: '경보/주의보 이력', url: 'event-history' },
          { name: '기타 이벤트 이력', url: 'event-etc-history' },
        ],
      },
      {
        name: '장애관리',
        url: 'fault-management',
        subMenus: [{ name: '장애이력', url: 'fault-history' }],
      },
    ],
    []
  );

  useEffect(() => {
    const pathArray = location.pathname.split('/').filter(Boolean);
    const relevantPath = pathArray.slice(2); // ecrm, ec 제외

    console.log('Current path array:', relevantPath);

    if (relevantPath.length === 0 || relevantPath[0] === 'dashboard') {
      setActiveTopMenu('dashboard');
      setActiveLeftMenu('');
      setActiveLeftMenuNm('현황판');
      return;
    }

    const currentTopMenu = relevantPath[0];
    const currentLeftMenu = relevantPath[1];

    // topMenuItems에서 현재 메뉴 찾기
    const topMenuItem = topMenuItems.find(
      (item) => item.url === currentTopMenu
    );

    if (topMenuItem) {
      console.log('Setting active top menu:', topMenuItem.url);
      setActiveTopMenu(topMenuItem.url);

      if (currentLeftMenu) {
        const subMenu = topMenuItem.subMenus.find(
          (sub) => sub.url === currentLeftMenu
        );
        if (subMenu) {
          setActiveLeftMenu(currentLeftMenu);
          setActiveLeftMenuNm(subMenu.name);
        }
      } else if (topMenuItem.subMenus.length > 0) {
        // 서브메뉴가 있는데 선택되지 않은 경우 첫 번째 서브메뉴 선택
        const firstSubMenu = topMenuItem.subMenus[0];
        setActiveLeftMenu(firstSubMenu.url);
        setActiveLeftMenuNm(firstSubMenu.name);
      }
    }
  }, [location.pathname, topMenuItems]);

  useEffect(() => {
    console.log('Current location:', location);
  }, [location]);0

  const resetAllStates = useCallback(() => {
    setActiveTopMenu('dashboard');
    setActiveLeftMenu('');
    setActiveLeftMenuNm('현황판');
    setKey((prev) => prev + 1);
    navigate('/ecrm/ec/dashboard', { replace: true });
  }, [navigate]);

  const handleTopMenuClick = useCallback(
    (selectedTopMenuItem: MenuItem) => {
      console.log('Handling menu click:', selectedTopMenuItem);

      if (selectedTopMenuItem.url === 'dashboard') {
        resetAllStates();
        return;
      }

      if (
        selectedTopMenuItem.subMenus &&
        selectedTopMenuItem.subMenus.length > 0
      ) {
        const firstSubMenu = selectedTopMenuItem.subMenus[0];
        const newPath = `/ecrm/ec/${selectedTopMenuItem.url}/${firstSubMenu.url}`;

        console.log('Setting new path:', newPath);

        // 상태 업데이트
        setActiveTopMenu(selectedTopMenuItem.url);
        setActiveLeftMenu(firstSubMenu.url);
        setActiveLeftMenuNm(firstSubMenu.name);

        // navigate로 페이지 이동
        navigate(newPath, { replace: true });
      }
    },
    [navigate]
  );

  const handleLeftMenuClick = useCallback(
    (selectedLeftMenu: SubMenu) => {
      setActiveLeftMenu(selectedLeftMenu.url);
      setActiveLeftMenuNm(selectedLeftMenu.name);

      const currentTopMenu = topMenuItems.find((item) =>
        item.subMenus.some((sub) => sub.url === selectedLeftMenu.url)
      );

      if (currentTopMenu) {
        setActiveTopMenu(currentTopMenu.url);
        navigate(`/ecrm/ec/${currentTopMenu.url}/${selectedLeftMenu.url}`, {
          replace: true,
        });
      }
    },
    [topMenuItems, navigate]
  );

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('EcLoggedIn');
    const isLoggedIn_A = localStorage.getItem('EcLoggedIn_A');
    if (isLoggedIn == 'true') {
      navigate('/ec/dashboard',{replace : true});
    }
    else if(isLoggedIn_A != 'true'){
      window.location.href = "https://keep.ktssolution.co.kr/ec";
    }
  },[])

  return (
    <SearchBarProvider>
      <div id='wrap' key={key}>
        <Header
          activeMenu={activeTopMenu}
          menuItems={topMenuItems}
          onMenuSelect={handleTopMenuClick}
          onReset={resetAllStates}
        />
        <div className='container-fluid'>
          <div className='row'>
            {activeTopMenu && activeTopMenu !== 'dashboard' && (
              <Left
                activeTopMenu={activeTopMenu}
                activeLeftMenu={activeLeftMenu}
                menuItems={topMenuItems}
                onMenuSelect={handleLeftMenuClick}
              />
            )}
            <MainContent
              activeTopMenu={activeTopMenu}
              activeLeftMenu={activeLeftMenu}
              activeLeftMenuNm={activeLeftMenuNm}
              setActiveLeftMenu={setActiveLeftMenu}
            />
          </div>
        </div>
        <Footer />
      </div>
    </SearchBarProvider>
  );
};

export default React.memo(EcMain);
