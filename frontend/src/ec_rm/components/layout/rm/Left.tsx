import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (subMenu: SubMenu) => {
    const path = `/ecrm/rm/${activeTopMenu}/${subMenu.url}`;

    navigate(path, {
      replace: true,
      state: {
        refresh: true,
        timestamp: new Date().getTime(),
      },
    });

    onMenuSelect(subMenu);
  };

  const activeItem = menuItems.find((item) => item.url === activeTopMenu);

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
                    to={`/ecrm/rm/${activeTopMenu}/${subMenu.url}`}
                    className='nav-link'
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick(subMenu);
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
