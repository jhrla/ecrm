import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MyPage from '../MyPage';
import WebSocketManager from '../../../utils/WebSocketManager';
import { IMessage } from '@stomp/stompjs';

import { RootState } from '../../../../store/store';
import {
  removeEventData,
  setEventData,
  initializeFromStorage,
  clearAllEventData,
} from '../../../../store/state/eventSlice';
import { useDispatch, useSelector } from 'react-redux';
import { resetToAll, updateCurrentLevel } from 'store/state/historySlice';
import ApiClient from 'ec_rm/utils/ApiClient';

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
  onReset: () => void;
}

interface Message {
  content: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeMenu,
  menuItems,
  onMenuSelect,
  onReset,
}) => {
  const [isSoundActive, setIsSoundActive] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [receivedMessage, setReceivedMessage] = useState<string | null>(null);
  const eventStatus = useSelector((state: RootState) => {
    if (!state.event) return []; // store 초기화 전이면 빈 배열 반환
    return state.event.eventData;
  });

  const currentLevel = useSelector(
    (state: RootState) => state.history.currentLevel
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const hasActiveEventsRef = useRef<boolean>(false);
  const subscriptionsRef = useRef<{ [key: string]: boolean }>({});

  const [iframeLoaded, setIframeLoaded] = useState(false);

  // 사운드 재생 여부를 추적하는 새로운 ref 추가
  const hasPlayedSoundRef = useRef<boolean>(false);

  // stopAlertSound 먼저 선언
  const stopAlertSound = useCallback(() => {
    if (!audioRef.current || !isPlayingRef.current) return;

    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    isPlayingRef.current = false;
    console.log('중지 성공');
  }, []);

  // playAlertSound 수정
  const playAlertSound = useCallback(async () => {
    try {
      if (!audioRef.current || !isSoundActive) return;

      const audio = audioRef.current;
      console.log('재생 시도');

      audio.volume = 1;
      audio.currentTime = 0;
      audio.loop = true;

      // 사용자 상호작용 이벤트 핸들러 내에서 재생
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isPlayingRef.current = true;
            console.log('재생 성공');
          })
          .catch((error) => {
            console.error('재생 실패:', error);
            isPlayingRef.current = false;
            setIsSoundActive(false);
          });
      }
    } catch (error) {
      console.error('재생 실패:', error);
      isPlayingRef.current = false;
      setIsSoundActive(false);
    }
  }, [isSoundActive]);

  // eventMessageHandler 선언
  const eventMessageHandler = useCallback(
    (message: IMessage) => {
      try {
        const parsedData = JSON.parse(message.body);
        if (!parsedData) return;

        setReceivedMessage(parsedData);
        dispatch(setEventData(parsedData));

        // 경보(event_kind: 1)일 때만 사운드 재생
        if (
          parsedData.event_kind === 1 &&
          !isPlayingRef.current &&
          isSoundActive
        ) {
          playAlertSound();
        }
      } catch (error) {
        console.error('Event message handling failed:', error);
      }
    },
    [dispatch, playAlertSound, isSoundActive]
  );

  // clearMessageHandler 선언
  const clearMessageHandler = useCallback(
    (message: IMessage) => {
      try {
        const parsedData = JSON.parse(message.body);
        if (!parsedData?.event_id) return;

        dispatch(removeEventData(parsedData.event_id));

        const remainingEvents = eventStatus.filter(
          (event) => event.event_id !== parsedData.event_id
        );

        if (remainingEvents.length === 0) {
          stopAlertSound();
        }
      } catch (error) {
        console.error('Clear message handling failed:', error);
      }
    },
    [dispatch, eventStatus, stopAlertSound]
  );

  // 문서 클릭 이벤트 리스너 수정
  useEffect(() => {
    const handleClick = () => {
      // 이벤트가 있고 사운드가 활성화되어 있을 때만 재생 시도
      if (
        hasActiveEventsRef.current &&
        isSoundActive &&
        !isPlayingRef.current
      ) {
        playAlertSound();
      }
    };

    return () => {};
  }, [playAlertSound, isSoundActive]);

  // 이벤트 상태 감시 수정
  useEffect(() => {
    // 경보 이벤트가 있는지 확인
    const hasAlertEvent = eventStatus.some((event) => event.event_kind === 1);
    hasActiveEventsRef.current = hasAlertEvent;

    if (hasAlertEvent && isSoundActive && !isPlayingRef.current) {
      playAlertSound();
    } else if (!hasAlertEvent && isPlayingRef.current) {
      stopAlertSound();
    }
  }, [eventStatus, isSoundActive, playAlertSound, stopAlertSound]);

  // 오디오 초기화 부분 수정
  useEffect(() => {
    try {
      const audioPath = `${process.env.PUBLIC_URL}/audio/siren.mp3`;
      console.log('오디오 파일 경로:', audioPath);

      if (audioRef.current) {
        return; // 이미 초기화되어 있으면 중복 로드 방지
      }

      const audio = new Audio();
      audio.id = 'alertSound';
      audio.loop = true;
      audio.preload = 'auto'; // 'none'에서 'auto'로 변경
      audio.src = audioPath;

      audioRef.current = audio;

      // 오디오 로드
      audio.load();
    } catch (error) {
      console.error('오디오 초기화 에러:', error);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 웹소켓 구독 설정
  useEffect(() => {
    const webSocketManager = WebSocketManager.getInstance();
    let isSubscribed = false;

    const setupWebSocket = async () => {
      try {
        if (!webSocketManager.isConnectedAndReady()) {
          await webSocketManager.connect();
        }

        if (!isSubscribed) {
          webSocketManager.subscribe('/event/messages', eventMessageHandler);
          webSocketManager.subscribe(
            '/event/clearMessage',
            clearMessageHandler
          );
          isSubscribed = true;
        }
      } catch (error) {
        console.error('WebSocket setup failed:', error);
      }
    };

    setupWebSocket();

    return () => {
      if (isSubscribed) {
        webSocketManager.unsubscribe('/event/messages');
        webSocketManager.unsubscribe('/event/clearMessage');
        isSubscribed = false;
      }
    };
  }, [eventMessageHandler, clearMessageHandler]);

  // 이벤트 클릭 핸들러 수정
  const handleEventClick = useCallback(() => {
    if (window.location.pathname.includes('dashboard')) {
      const baseUrl = window.location.pathname.split('?')[0]; // URL 파라미터 제거
      const newUrl = `${baseUrl}?reset=true&level=land&ts=${Date.now()}`;
      window.location.href = newUrl;
    } else {
      navigate('/ecrm/ec/dashboard', {
        replace: true,
        state: {
          refresh: true,
          timestamp: new Date().getTime(),
        },
      });
    }
  }, [navigate]);

  // 현재 시각을 위한 state 추가
  const [currentTime, setCurrentTime] = useState(new Date());

  // 시간 업데이트를 위한 useEffect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 시간 포맷팅 함수 수정
  const formatTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // renderTopNotice 수정
  const renderTopNotice = () => {
    if (eventStatus.length > 0) {
      return (
        <div className='titleArea row black'>
          <h2 className='col-lg-4 col-md-12'>
            스마트 안전관리 플랫폼 종합 상황판
            <img
              onClick={toggleSound}
              src={`${process.env.PUBLIC_URL}/images/fire_speak_${isSoundActive ? 'on' : 'off'}.png`}
              alt={isSoundActive ? '알림음 비활성화' : '알림음 활성화'}
              style={{
                marginLeft: '10px',
                cursor: 'pointer',
                width: '24px',
                height: '24px',
              }}
            />
          </h2>
          <div className='alert col-lg-3 col-md-12'>
            <div
              className='warning_top blink-animation'
              onClick={handleEventClick}
              style={{
                cursor: 'pointer',
                backgroundColor: '#ff0000',
                color: '#ffffff',
                borderRadius: '4px',
              }}
            >
              ⚠️ 새로운 이벤트가 감지되었습니다! ({eventStatus.length}) ⚠️
            </div>
          </div>
          <div className='renewal col-lg-5 col-md-12'>
            <span>
              <img
                src={`${process.env.PUBLIC_URL}/images/icon_timer.png`}
                alt='타이머 아이콘'
              />
              {formatTime(currentTime)}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className='titleArea row black'>
        <h2
          className='col-lg-4 col-md-12'
          style={{ display: 'flex', alignItems: 'center' }}
        >
          스마트 안전관리 플랫폼 종합 상황판
          <img
            onClick={toggleSound}
            src={`${process.env.PUBLIC_URL}/images/fire_speak_${isSoundActive ? 'on' : 'off'}.png`}
            alt={isSoundActive ? '알림음 비활성화' : '알림음 활성화'}
            style={{
              marginLeft: '10px',
              cursor: 'pointer',
              width: '24px',
              height: '24px',
            }}
          />
        </h2>
        <div className='alert col-lg-3 col-md-12'></div>
        <div className='renewal col-lg-5 col-md-12'>
          <span>
            <img
              src={`${process.env.PUBLIC_URL}/images/icon_timer.png`}
              alt='타이머 아이콘'
            />
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    );
  };

  // eventStatus가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    try {
      if (eventStatus.length > 0) {
        // 이벤트가 있을 때만 저장
        console.log('이벤트 상태 저장:', eventStatus);
        localStorage.setItem('eventData', JSON.stringify(eventStatus));
      } else {
        // 이벤트가 없으면 로컬 스토리지에서 제거
        localStorage.removeItem('eventData');
      }
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error);
    }
  }, [eventStatus]);

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 복원
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        localStorage.removeItem('eventData');
        dispatch(clearAllEventData());
        const response = await ApiClient.post('/api/getDashBoardEventList');
        const parsedEventData = response.data;

        if (Array.isArray(parsedEventData) && parsedEventData.length > 0) {
          parsedEventData.forEach((eventData) => {
            dispatch(setEventData(eventData));
          });

          // 경보(event_kind: 1)가 있는 경우에만 사운드 재생
          const hasAlertEvent = parsedEventData.some(
            (event) => event.event_kind === 1
          );
          hasActiveEventsRef.current = hasAlertEvent;

          if (hasAlertEvent && !isPlayingRef.current && isSoundActive) {
            playAlertSound();
          }
        }
      } catch (error) {
        console.error('데이터베이스에서 데이터 복원 실패:', error);
      }
    };

    fetchEventData();
  }, []);

  // WebSocket 재연결 핸들러 수정
  const handleReconnect = useCallback(() => {
    try {
      const savedEventData = localStorage.getItem('eventStatus');
      if (savedEventData) {
        const parsedEventData = JSON.parse(savedEventData);
        if (Array.isArray(parsedEventData)) {
          parsedEventData.forEach((eventData) => {
            dispatch(setEventData(eventData));
          });

          // 이벤트가 있다면 사운드 재생
          if (parsedEventData.length > 0) {
            hasActiveEventsRef.current = true;
            playAlertSound();
          }
        }
      }
    } catch (error) {
      console.error('재연결 시 데이터 복원 실패:', error);
    }
  }, [dispatch, playAlertSound]);

  useEffect(() => {
    const webSocketManager = WebSocketManager.getInstance();
    webSocketManager.onReconnect(handleReconnect);

    return () => {
      webSocketManager.offReconnect(handleReconnect);
    };
  }, [handleReconnect]);

  // 이벤트 상태가 완전히 클리어될 때 재생 상태도 초기화
  useEffect(() => {
    if (eventStatus.length === 0) {
      hasPlayedSoundRef.current = false;
      stopAlertSound();
    }
  }, [eventStatus, stopAlertSound]);

  // 스피커 아이콘 클릭 핸들러 수정
  const toggleSound = () => {
    if (!isSoundActive) {
      setIsSoundActive(true);
      if (hasActiveEventsRef.current) {
        playAlertSound();
      }
    } else {
      setIsSoundActive(false);
      stopAlertSound();
    }
  };

  // localStorage에 사운드 상태 저장
  useEffect(() => {
    localStorage.setItem('soundActive', JSON.stringify(isSoundActive));
  }, [isSoundActive]);

  // 컴포넌트 마운트 시 저장된 사운드 상태 복원
  useEffect(() => {
    const savedSoundState = localStorage.getItem('soundActive');
    if (savedSoundState) {
      setIsSoundActive(JSON.parse(savedSoundState));
    }
  }, []);

  // handleMenuClick 수정
  const handleMenuClick = useCallback(
    (item: TopMenuItem) => {
      console.log('Menu clicked:', item);

      // 메뉴 선택 처리를 상위 컴포넌트에 위임
      onMenuSelect(item);
    },
    [onMenuSelect]
  );

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
            <span className='ec'>EC</span>
          </a>
        </h1>
        <nav className='topnav'>
          <ul>
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={`mo_menu_0${index + 1} ${
                  activeMenu.startsWith(item.url.replace(/^\//, '')) ? 'on' : ''
                }`}
                onClick={() => handleMenuClick(item)}
              >
                <Link to={`/ecrm/ec/${item.url.replace(/^\//, '')}`}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <MyPage />
      {renderTopNotice()}
      {/* 숨겨진 iframe 추가 */}
    </header>
  );
};
