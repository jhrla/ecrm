import React, { useState, useCallback, useEffect } from 'react';
import BuildHeader from './BuildHeader';
import { CustomerInfo, EventData, FloorInfo } from '../interface/DashboardType';
import { RootState } from 'store/store';
import { useDispatch, useSelector } from 'react-redux';
import ReactDOM from 'react-dom';
import axios from 'axios';
import ApiClient from 'ec_rm/utils/ApiClient';
import { resetToAll } from 'store/state/historySlice';
import { useNavigate } from 'react-router-dom';

interface BuildingAreaProps {
  customerInfo: CustomerInfo | undefined;
  floorList: FloorInfo[];
  eventData: EventData;
  onPageChange: (pageName: string, floor: FloorInfo | undefined) => void;
  onPageExitStatusChange: (
    pageName: string,
    floor: FloorInfo | undefined
  ) => void;
}

interface MemoizedFloorProps {
  floor: FloorInfo;
  isHighlighted: boolean;
  isActive: boolean;
  onMouseOver: () => void;
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const BuildingArea: React.FC<BuildingAreaProps> = ({
  customerInfo,
  floorList,
  eventData,
  onPageChange,
  onPageExitStatusChange,
}) => {
  const [highlightedFloor, setHighlightedFloor] = useState<number>(); // 2층이 초기 하이라이트 상태
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태
  const [selectedFloor, setSelectedFloor] = useState<FloorInfo>();
  const [dashboardState, setDashboardState] = useState({}); // Dashboard 상태 관리
  const eventStatus = useSelector((state: RootState) => state.event.eventData);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('이벤트 상태:', eventStatus);
    console.log('이벤트 종류:', eventStatus?.[0]?.event_kind);
    console.log('층:', eventStatus?.[0]?.floor_no);
  }, [eventStatus]);

  const highlight = (floor: number) => {
    setHighlightedFloor(floor);
  };

  const handlePopoverToggle = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
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

  const handleModalOpen = () => {
    setIsModalOpen(true); // 모달 열기
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // 모달 닫기
  };

  const pageChange = (pageName: string) => {
    onPageChange(pageName, selectedFloor);
    handlePopoverClose(); // 페이지 변경 시에도 툴팁 닫기
  };

  const pageExitStatusChange = (pageName: string) => {
    onPageExitStatusChange(pageName, selectedFloor);
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
        <span className='close-btn' onClick={handlePopoverClose}></span>
      </div>
      <div className='popover-body'>
        <ul>
          <li>
            <span>화재상황</span>
            <button
              className='btn btn-sm btn-primary'
              onClick={() => pageExitStatusChange('ExitStatus')}
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

  const MemoizedFloor = React.memo<MemoizedFloorProps>(
    ({ floor, isHighlighted, isActive, onMouseOver, onClick }) => {
      // eventStatus를 직접 사용
      const eventStatus = useSelector(
        (state: RootState) => state.event.eventData
      );

      // 컴포넌트가 리렌더링되는지 확인
      console.log('Floor rendering:', floor.floor_name);

      // 스타일 계산
      const style = React.useMemo(() => {
        const floorEvents = eventStatus?.filter(
          (event) =>
            Number(event.floor_no) === Number(floor.floor_no) &&
            event.contract_code === customerInfo?.contract_code &&
            event.client_code === customerInfo?.client_code
        );
        if (floorEvents && floorEvents.length > 0) {
          // 화재경보(1) 있는지 먼저 확인
          if (floorEvents.some((event) => Number(event.event_kind) === 1)) {
            return { backgroundColor: '#EC4057' }; // 화재경보 (빨간색)
          }
          // 화재주의보(2) 확인
          if (floorEvents.some((event) => Number(event.event_kind) === 2)) {
            return { backgroundColor: '#ff9800' }; // 화재주의보 (주황색)
          }
          return { backgroundColor: '#3185DB' }; // 일반 이벤트 (파란색)
        }

        // 이벤트가 없는 경우 기존 스타일 적용
        if (isHighlighted) {
          return { backgroundColor: '#a6a6a6' }; // hover 시 진한 회색
        }
        return { backgroundColor: '#cccccc' }; // 기본 회색
      }, [floor.floor_no, isHighlighted, eventStatus]);

      return (
        <div
          className={`floor ${isHighlighted ? 'active' : ''}`}
          style={style}
          onMouseOver={onMouseOver}
          onClick={onClick}
        >
          {floor.floor_name}
        </div>
      );
    }
    // 메모이제이션 비교 함수 제거 (useSelector가 자동으로 처리)
  );

  const MemoizedFloor_h = React.memo(() => <div className={`floor_h`}></div>);

  const renderFloors_h = useCallback(
    () => floorList.map((floor) => <MemoizedFloor_h key={floor.floor_no} />),
    [floorList, highlightedFloor, eventData?.floor_no]
  );

  const handleToMap = () => {
    dispatch(resetToAll());
  };

  const renderFloors = useCallback(
    () =>
      floorList.map((floor) => (
        <MemoizedFloor
          key={floor.floor_no}
          floor={floor}
          isHighlighted={highlightedFloor === Number(floor.floor_no)}
          isActive={
            !!(
              floor.floor_no &&
              floor.floor_no === eventData?.floor_no &&
              eventData?.contract_code === customerInfo?.contract_code &&
              eventData?.client_code === customerInfo?.client_code
            )
          }
          onMouseOver={() => highlight(Number(floor.floor_no))}
          onClick={(e) => handlePopoverToggle(e, floor)}
        />
      )),
    [floorList, highlightedFloor, eventData?.floor_no]
  );

  // MemoizedSideFloor 컴포넌트 추가
  const MemoizedSideFloor = React.memo<{
    floor: FloorInfo;
    isHighlighted: boolean;
  }>(({ floor, isHighlighted }) => {
    const eventStatus = useSelector(
      (state: RootState) => state.event.eventData
    );

    const style = React.useMemo(() => {
      const floorEvents = eventStatus?.filter(
        (event) =>
          Number(event.floor_no) === Number(floor.floor_no) &&
          event.contract_code === customerInfo?.contract_code &&
          event.client_code === customerInfo?.client_code
      );

      if (floorEvents && floorEvents.length > 0) {
        // 화재경보(1) 있는지 먼저 확인
        if (floorEvents.some((event) => Number(event.event_kind) === 1)) {
          return { backgroundColor: '#EC4057' }; // 화재경보 (빨간색)
        }
        // 화재주의보(2) 확인
        if (floorEvents.some((event) => Number(event.event_kind) === 2)) {
          return { backgroundColor: '#ff9800' }; // 화재주의보 (주황색)
        }
        return { backgroundColor: '#3185DB' }; // 일반 이벤트 (파란색)
      }

      // 이벤트가 없는 경우 기존 스타일 적용
      if (isHighlighted) {
        return { backgroundColor: '#a6a6a6' }; // hover 시 진한 회색
      }
      return { backgroundColor: '#cccccc' }; // 기본 회색
    }, [floor.floor_no, isHighlighted, eventStatus]);

    return (
      <div className={`floor ${isHighlighted ? 'active' : ''}`} style={style} />
    );
  });

  // renderSideFloors 함수 수정
  const renderSideFloors = useCallback(
    () =>
      floorList.map((floor) => (
        <MemoizedSideFloor
          key={floor.floor_no}
          floor={floor}
          isHighlighted={highlightedFloor === Number(floor.floor_no)}
        />
      )),
    [floorList, highlightedFloor]
  );

  useEffect(() => {
    console.log('eventStatus 변경됨:', eventStatus);
    // 강제 리렌더링을 위한 상태 업데이트
    setDashboardState((prev) => ({ ...prev }));
  }, [eventStatus]);

  return (
    <div className='building_area center_area'>
      {/* 검색영역 */}

      <BuildHeader customerInfo={customerInfo} />
      {/* 건물영역 */}
      <div className='building_wrap'>
        <button
          type='button'
          className='backtomap btn btn-success'
          onClick={handleToMap}
        >
          <i className='ti-map-alt'></i> 지도
        </button>
        <div className='citybuilding'>
          <div className='height'>{renderFloors_h()}</div>
          <div className='face front'>{renderFloors()}</div>
          <div className='face side'>{renderSideFloors()}</div>
          <div className='top'></div>
        </div>
        {/* 툴팁을 항상 body 내부에 렌더링 */}
        {popoverVisible &&
          ReactDOM.createPortal(renderTooltip(), document.body)}
      </div>
    </div>
  );
};

export default BuildingArea;
