import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState } from 'store/store';
import {CustomerInfo, FloorInfo} from '../interface/DashboardType';
import axios from 'axios';
import ApiClient from 'ec_rm/utils/ApiClient';

interface EventAlarmProps {
  floorList: FloorInfo[];
  onPageChange: (pageName: string, floor: FloorInfo | undefined) => void;
  customerInfo: CustomerInfo | undefined;
}

const EventAlarm: React.FC<EventAlarmProps> = ({ floorList, onPageChange,customerInfo }) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const eventStatus = useSelector((state: RootState) => state.event.eventData);
  const alertCount = useSelector((state: RootState) => state.event.alertCount);
  const warningCount = useSelector(
    (state: RootState) => state.event.warningCount
  );
  const [selectedFloor, setSelectedFloor] = useState<FloorInfo>();

  const handlePopoverToggle = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    floor: FloorInfo
  ) => {
    setSelectedFloor(floor);
    const rect = event.currentTarget.getBoundingClientRect();
    const xOffset = 150;
    setPopoverPosition({
      x: rect.left - xOffset,
      y: rect.top + window.scrollY,
    });
    setPopoverVisible((prev) => !prev); // 현재 상태 반전
  };

  const handlePopoverClose = () => {
    setPopoverVisible(false); // 닫기 버튼 클릭 시 툴팁 닫힘
  };

  const pageChange = (pageName: string) => {
    onPageChange(pageName, selectedFloor);
    handlePopoverClose(); // 페이지 변경 시에도 툴팁 닫기
  };

  const sendSms = async () => {
    const filteredEventStatus = eventStatus.filter((item) =>
        item.contract_code === customerInfo?.contract_code
    );
    if (!filteredEventStatus || !filteredEventStatus[0]) return;
    const updatedEventStatus = {
      ...eventStatus[0],
      emergency_tel1: customerInfo?.emergency_tel1, // 전화번호 리스트 추가
      emergency_tel2: customerInfo?.emergency_tel2,
      emergency_tel3: customerInfo?.emergency_tel3,
    };
    const hasKeyWithValue = filteredEventStatus.some((item) =>
        ["화재경보", "화재 경보"].includes(item.event_name === null ? "" : item.event_name)
    );
    if(hasKeyWithValue) {
      try {
        const response = await ApiClient.post(
            '/api/sendEventSms',
            updatedEventStatus,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
        );

        alert('문자 메세지 발송완료');
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    }
  };

  const renderTooltip = () => (
    <div
      className='popover fade show'
      style={{
        position: 'absolute',
        top: `${popoverPosition.y}px`,
        left: `${popoverPosition.x}px`,
        backgroundColor: '#333',
        color: '#fff',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        width: '255px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className='popover-header'>
        {selectedFloor?.floor_name || '층 정보 없음'} 상황조회
        <span
          className='close-btn'
          onClick={handlePopoverClose}
          style={{ cursor: 'pointer' }}
        ></span>
      </div>
      <div className='popover-body'>
        <ul>
          <li>
            <span>화재상황</span>
            <button
              className='btn btn-sm btn-primary'
              onClick={() => pageChange('ExitStatus')}
            >
              화재상황
            </button>
          </li>
          {/* <li>
            <span>장치상태</span>
            <button
              className='btn btn-sm btn-primary'
              onClick={() => pageChange('SmokeRoute')}
            >
              장치상태
            </button>
          </li> */}
          <li>
            <span>SMS 발송</span>
            <button
              className='btn btn-sm btn-primary'
              onClick={() => sendSms()}
            >
              SMS발송
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  const getFloorClassName = (floor: FloorInfo) => {
    if (!eventStatus || eventStatus.length === 0) return '';

    // 해당 층의 모든 이벤트를 찾습니다
    const floorEvents = eventStatus?.filter(
        (event) =>
            Number(event.floor_no) === Number(floor.floor_no) &&
            event.contract_code === customerInfo?.contract_code &&
            event.client_code === customerInfo?.client_code
    );

    if (floorEvents.length > 0) {
      // 화재경보(1) 있는지 먼저 확인
      if (floorEvents.some((event) => Number(event.event_kind) === 1)) {
        return 'al'; // 경보 (빨간색)
      }
      // 화재주의보(2) 확인
      if (floorEvents.some((event) => Number(event.event_kind) === 2)) {
        return 'wa'; // 주의보 (주황색)
      }
    }
    return '';
  };

  const forceRecover = async () => {
    const isConfirmed =
        window.confirm("장비 신규설치 및 변경시 남아있는 경보, 주의보를 새로고침합니다. 진행하시겠습니까?");
    if(isConfirmed) {
      try {
        const response = await ApiClient.post(
            '/api/forceRecover',
            customerInfo,
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              responseType: 'json',
            }
        );
        console.log(response)
        alert('처리되었습니다.')
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('API 오류:', error.response?.data);
        }
        console.error('수동복구 API 오류:', error);
      }
    }
  };

  return (
    <div className='event_area'>
      <div className='position_inner'>
        <button
          type='button'
          onClick={handlePopoverClose}
          className='event_button'
        >
          <i className='ti-angle-right'></i>
          <span>닫기</span>
        </button>
        <div className='inner_event'>
          <h3 className='main_title'>이벤트 발생현황</h3>

          <div className='e_tit blue'
          style={{display:'flex', justifyContent:'space-between'}}>
            <h3>실시간 이벤트 발생현황</h3>
            <button style={{backgroundColor: '#425c91',color: 'yellow',fontSize: '0.7rem'}}
            onClick={forceRecover}>
              새로고침
            </button>
          </div>
          <div className='e_cont'>
            <div className='row mg00'>
              <div className='col warning'>
                <div className='tit'>
                  경보
                  <br />
                  <img
                    src={`${process.env.PUBLIC_URL}/images/icon_alert_02.png`}
                    alt='경보 아이콘'
                  />
                </div>
                <span className='num'>{alertCount}</span>
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
                <span className='num'>{warningCount}</span>
              </div>
            </div>
          </div>

          <h4 className='e_tit red'>건물 이벤트 현황</h4>

          <div className='e_cont scroll'>
            <ul className='floor'>
              {floorList.map((floor, index) => (
                <li
                  key={index}
                  className={getFloorClassName(floor)}
                  onClick={(e) => handlePopoverToggle(e, floor)}
                >
                  <span>{floor.floor_name}</span>
                </li>
              ))}
            </ul>
          </div>

          {popoverVisible &&
            ReactDOM.createPortal(renderTooltip(), document.body)}
        </div>
      </div>
    </div>
  );
};

export default EventAlarm;
