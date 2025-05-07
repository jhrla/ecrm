import React, { useState } from 'react';

const MemberLogin: React.FC = () => {
  // 드롭다운 메뉴 상태를 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 드롭다운 토글 함수
  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    console.log('로그아웃 처리');
    // 로그아웃 로직을 여기에 추가
    localStorage.clear()
    window.location.href = "https://keep.ktssolution.co.kr/ec"
  };

  // 비밀번호 변경 처리 함수 (모달 열기)
  const handleChangePassword = () => {
    console.log('비밀번호 변경 모달 열기');
    // 비밀번호 변경 모달 열기 로직을 여기에 추가
  };

  return (
    <div className='member_login'>
      <button type='button' id='cd-menu-trigger'>
        <span className='cd-menu-icon'></span>
      </button>
      <ul className='navbar-nav'>
        <li className='nav-item dropdown'>
          <button
            className='nav-item nav-link dropdown-toggle mr-md-2'
            id='bd-versions'
            onClick={handleDropdownToggle}
            aria-haspopup='true'
            aria-expanded={isDropdownOpen}
          >
            <i className='icon icon_member'></i>
            <span>내정보</span>
          </button>
          {isDropdownOpen && (
            <div
              className='dropdown-menu dropdown-menu-right show'
              aria-labelledby='bd-versions'
              style={{ position: 'absolute' }}
            >
              <button className='dropdown-item' onClick={handleLogout}>
                <i className='ti-unlock'></i> 로그아웃
              </button>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

export default MemberLogin;
