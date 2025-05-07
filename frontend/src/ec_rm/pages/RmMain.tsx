import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Header } from '../components/layout/rm/Header';
import { Left } from '../components/layout/rm/Left';
import { MainContent } from '../components/layout/rm/MainContent';
import { Footer } from '../components/layout/Footer';
import { SearchBarProvider } from '../contexts/SearchProvider';

interface SubMenu {
  name: string;
  url: string;
}

interface MenuItem {
  name: string;
  url: string;
  subMenus: SubMenu[];
}

interface TopMenuItem {
  name: string;
  url: string;
  subMenus: SubMenu[];
}

const RmMain = (): JSX.Element => {
  const [activeTopMenu, setActiveTopMenu] = useState('customer-info');
  const [activeLeftMenu, setActiveLeftMenu] = useState('management');
  const [activeLeftMenuNm, setActiveLeftMenuNm] = useState('고객관리');

  const location = useLocation();
  const navigate = useNavigate();

  const topMenuItems: TopMenuItem[] = [
    {
      name: '고객정보',
      url: 'customer-info',
      subMenus: [{ name: '고객관리', url: 'management' }],
    },
    {
      name: '장비정보',
      url: 'device-info',
      subMenus: [
        { name: '평면도/층정보 등록', url: 'device-quantity' },
        { name: '평면도 생성', url: 'floor-device' },
        { name: '장비설정하기', url: 'device-setup' },
      ],
    },

    {
      name: '통계관리',
      url: 'statistics',
      subMenus: [{ name: '주기보고 데이터', url: 'periodic-report' }],
    },
  ];

  // URL 변경 감지하여 메뉴 상태 업데이트
  useEffect(() => {
    const pathArray = location.pathname.split('/').filter(Boolean);

    // ecrm/rm 이후의 경로를 확인
    if (pathArray[0] === 'ecrm' && pathArray[1] === 'rm') {
      const currentTopMenu = pathArray[2] || 'customer-info';
      const currentLeftMenu = pathArray[3] || 'management';

      const topMenuItem = topMenuItems.find(
        (item) => item.url === currentTopMenu
      );
      if (topMenuItem) {
        setActiveTopMenu(currentTopMenu);

        if (currentLeftMenu) {
          const subMenu = topMenuItem.subMenus.find(
            (sub) => sub.url === currentLeftMenu
          );
          if (subMenu) {
            setActiveLeftMenu(currentLeftMenu);
            setActiveLeftMenuNm(subMenu.name);
          }
        }
      }
    }
  }, [location.pathname]);

  const handleTopMenuClick = (selectedTopMenuItem: MenuItem) => {
    console.log('선택된 상단 메뉴:', selectedTopMenuItem);
    setActiveTopMenu(selectedTopMenuItem.url);

    if (selectedTopMenuItem.subMenus.length > 0) {
      const firstSubMenu = selectedTopMenuItem.subMenus[0];
      setActiveLeftMenu(firstSubMenu.url);
      setActiveLeftMenuNm(firstSubMenu.name);
      const newPath = `/ecrm/rm/${selectedTopMenuItem.url}/${firstSubMenu.url}`;
      if (location.pathname !== newPath) {
        navigate(newPath);
      }
    }
  };

  const handleLeftMenuClick = (selectedLeftMenu: SubMenu) => {
    setActiveLeftMenu(selectedLeftMenu.url);
    setActiveLeftMenuNm(selectedLeftMenu.name);

    const currentTopMenu = topMenuItems.find((item) =>
      item.subMenus.some((sub) => sub.url === selectedLeftMenu.url)
    );

    if (currentTopMenu) {
      setActiveTopMenu(currentTopMenu.url);
      const newPath = `/ecrm/rm/${currentTopMenu.url}/${selectedLeftMenu.url}`;
      if (location.pathname !== newPath) {
        navigate(newPath);
      }
    }
  };

  return (
    <SearchBarProvider>
      <div className='wrap'>
        <Header
          activeMenu={activeTopMenu}
          menuItems={topMenuItems}
          onMenuSelect={handleTopMenuClick}
        />
        <div className='container-fluid'>
          <div className='row flex-nowrap'>
            <Left
              activeTopMenu={activeTopMenu}
              activeLeftMenu={activeLeftMenu}
              menuItems={topMenuItems}
              onMenuSelect={handleLeftMenuClick}
            />
            <MainContent
              activeTopMenu={activeTopMenu}
              activeLeftMenu={activeLeftMenu}
              activeLeftMenuNm={activeLeftMenuNm}
            />
          </div>
        </div>
        <Footer />
      </div>
    </SearchBarProvider>
  );
};

export default RmMain;
