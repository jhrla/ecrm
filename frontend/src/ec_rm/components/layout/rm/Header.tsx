import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MyPage from '../MyPage';

interface SubMenu {
  name: string;
  url: string;
}

interface TopMenuItem {
  name: string;
  url: string;
  subMenus: SubMenu[];
}

interface HeaderProps {
  activeMenu: string;
  menuItems: TopMenuItem[];
  onMenuSelect: (menu: TopMenuItem) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMenu,
  menuItems,
  onMenuSelect,
}) => {
  const navigate = useNavigate();

  const handleMenuClick = (item: TopMenuItem) => {
    onMenuSelect(item);
    // 첫 번째 서브메뉴로 이동
    if (item.subMenus.length > 0) {
      const firstSubMenu = item.subMenus[0];
      navigate(`/ecrm/rm/${item.url}/${firstSubMenu.url}`);
    }
  };

  return (
    <header>
      <div className='inner row m-0 black'>
        <h1 className='logo'>
          <a
            href='/'
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/images/logo_2.png`}
              alt='KTSS 로고'
            />
            <span className='rm'>RM</span>
          </a>
        </h1>
        <nav className='topnav'>
          <ul>
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={`mo_menu_0${index + 1} ${
                  activeMenu === item.url ? 'on' : ''
                }`}
              >
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleMenuClick(item)}
                >
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <MyPage />
      <div className='titleArea'>
        <h2>스마트 안전관리 플랫폼 종합 상황판</h2>
      </div>
    </header>
  );
};
