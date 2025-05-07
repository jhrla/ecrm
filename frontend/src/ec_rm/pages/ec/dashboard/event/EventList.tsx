import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store/store';
import { EventData } from '../interface/DashboardType';

interface EventAreaProps {
  onEventClick: (eventData: EventData) => void;
  onPageChange: (pageName: string) => void;
}

const EventArea: React.FC<EventAreaProps> = ({ onEventClick }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAlertCount, setCurrentAlertCount] = useState(0);
  const [currentWarningCount, setCurrentWarningCount] = useState(0);

  const alertCount = useSelector((state: RootState) => state.event.alertCount);
  const warningCount = useSelector(
    (state: RootState) => state.event.warningCount
  );
  // Redux 상태 변화 추적을 위한 로그 추가
  const eventState = useSelector((state: RootState) => state.event);
  console.log('전체 이벤트 상태:', eventState);
  const eventStatus = useSelector((state: RootState) => state.event.eventData);

  const hideEvent = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    console.log('Alert Count changed:', alertCount);
    console.log('Warning Count changed:', warningCount);
    setCurrentAlertCount(alertCount);
    setCurrentWarningCount(warningCount);
  }, [alertCount, warningCount]);

  if (!isVisible) {
    return null; // 이벤트 영역이 숨겨지면 아무것도 렌더링하지 않음
  }

  return (
    <div className='event_area'>
      <div className='position_inner'>
        <button type='button' onClick={hideEvent} className='event_button'>
          <i className='ti-angle-right'></i>
          <span>닫기</span>
        </button>
        <div className='inner_event'>
          <h3 className='main_title'>이벤트 발생현황</h3>

          <h4 className='e_tit blue'>실시간 이벤트 발생현황</h4>
          <div className='e_cont '>
            <div className='row mg00'>
              <div className='col warning'>
                <div className='tit'>
                  경보
                  <br />
                  <img
                    src={`${process.env.PUBLIC_URL}/images/icon_alert_02.png`}
                    alt='경고 아이콘'
                  />
                </div>
                <span className='num'>{currentAlertCount}</span>
              </div>
              <div className='col caution'>
                <div className='tit'>
                  주의보
                  <br />
                  <img
                    src={`${process.env.PUBLIC_URL}/images/icon_alert_01.png`}
                    alt='주의보 아이콘'
                  />
                </div>
                <span className='num'>{currentWarningCount}</span>
              </div>
            </div>
          </div>

          <h4 className='e_tit red'>이벤트 목록</h4>

          <div className='e_cont scroll'>
            <ul>
              {eventStatus
                .slice()
                .reverse()
                .map((item, index) => (
                  <li
                    key={index}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onEventClick(item);
                    }}
                  >
                    <dl>
                      <dt>등급</dt>
                      <dd>{item.event_kind === 1 ? '경보' : '주의보'}</dd>
                      <dt>장애이벤트</dt>
                      <dd>{item.event_name}</dd>
                      <dt>발생시간</dt>
                      <dd>{item.event_time}</dd>
                      <dt>발생위치</dt>
                      <dd>{item.event_msg}</dd>
                      <dt>감지장비</dt>
                      <dd>{item.device_name}</dd>
                    </dl>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventArea;
