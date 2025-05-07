import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SubMenu {
  name: string;
  url: string;
}

interface TopMenuItem {
  name: string;
  url: string;
  subMenus: SubMenu[];
}

interface LeftProps {
  activeTopMenu: string;
  activeLeftMenu: string;
  menuItems: TopMenuItem[];
  onMenuSelect: (selectedLeftMenu: SubMenu) => void;
}

export const Left: React.FC<LeftProps> = ({
  activeTopMenu,
  activeLeftMenu,
  menuItems,
  onMenuSelect,
}) => {
  const location = useLocation();
  const activeItem = menuItems.find((item) => item.url === activeTopMenu);

  // URL이 변경될 때 해당하는 메뉴 자동 선택
  useEffect(() => {
    if (activeItem) {
      const currentPath = location.pathname;
      const matchingSubMenu = activeItem.subMenus.find((subMenu) =>
        currentPath.includes(subMenu.url)
      );

      if (matchingSubMenu && matchingSubMenu.url !== activeLeftMenu) {
        onMenuSelect(matchingSubMenu);
      }
    }
  }, [location.pathname, activeItem, activeLeftMenu, onMenuSelect]);

  return (
    <div className='left_menu flex-shrink-0 scrollbar-inner'>
      <ul className='left_depth1'>
        <li className='on'>
          {activeItem && (
            <ul className='left_depth2'>
              {activeItem.subMenus.map((subMenu) => (
                <li
                  key={subMenu.url}
                  className={activeLeftMenu === subMenu.url ? 'on' : ''}
                >
                  <Link
                    to={`/ecrm/rm/${activeItem.url}/${subMenu.url}`}
                    className='nav-link'
                    onClick={(e) => {
                      e.preventDefault(); // 기본 동작 방지
                      onMenuSelect(subMenu);
                    }}
                  >
                    {subMenu.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};
