import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store/store';
import {
  addToHistory,
  resetToAll,
  resetToPreviousState,
  updateCurrentLevel,
  updateSelectedArea,
  clearHistory,
  hardReset,
} from '../../../../store/state/historySlice';
import CustomerArea from './status/CustomerArea';
import MapArea from './maparea/MapArea';
import EventArea from './event/EventList';
import BuildingArea from './maparea/BuildingArea';
import {
  AreaData,
  CircleData,
  CustomerInfo,
  CustomerStatusInfo,
  DeviceInfo,
  EventData,
  FloorInfo,
} from './interface/DashboardType';
import EventAlarm from './event/EventAlram';
import ExitStatus from './modal/ExitStatus';
import SmokeRoute from './modal/SmokeRoute';
import CctvView from './modal/CctvView';
import ApiClient from 'ec_rm/utils/ApiClient';
import axios from 'axios';
import { setEventData } from '../../../../store/state/eventSlice';
import { useLocation, useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const dispatch = useDispatch();
  const currentLevel = useSelector(
    (state: RootState) => state.history.currentLevel
  );
  const selectedArea = useSelector(
    (state: RootState) => state.history.selectedArea
  );

  const eventStatus = useSelector((state: RootState) => {
    return (state as any).event?.eventData || [];
  });

  const [showMapArea, setShowMapArea] = useState<string>('map');
  const [customerStatusData, setCustomerStatusData] = useState<
    CustomerStatusInfo[]
  >([]);
  const [customerList, setCustomerList] = useState<CustomerInfo[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>();
  const [cityData, setCityData] = useState<CircleData[]>([]);
  const [deviceList, setDeviceList] = useState<DeviceInfo[]>([]);
  const [floorList, setFloorList] = useState<FloorInfo[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<FloorInfo>();
  const [eventUpdateKey, setEventUpdateKey] = useState(0);
  const [prevEventId, setPrevEventId] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // 데이터 변환 유틸리티 함수
  const transformCircleData = (data: any[]): CircleData[] => {
    return data.map((item) => {
      let center = { lat: 0, lng: 0 };

      if (typeof item.center === 'string') {
        const matches = item.center.match(/lat:([0-9.]+), lng:([0-9.]+)/);
        if (matches) {
          center = {
            lat: parseFloat(matches[1]),
            lng: parseFloat(matches[2]),
          };
        }
      }

      return {
        ...item,
        center,
        fillColor: '#33CAFB',
        strokeColor: '#468DF7',
        radius: 13000,
      };
    });
  };

  // 레벨별 데이터 가져오기
  const fetchAreaData = async () => {
    if (!currentLevel) return;
    try {
      const params = {
        level: currentLevel,
        ...(selectedArea?.code && { parent_id: selectedArea.code }),
      };

      const response = await ApiClient.post('/api/getAreaList', params, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        responseType: 'json',
      });
      console.log('구 레벨 Response:', response.data);

      // 레벨별로 다른 데이터 처리
      switch (currentLevel) {
        case 'land':
          setCityData(transformCircleData(response.data.cityList));
          setCustomerStatusData(response.data.customerList);
          break;
        case 'city':
          console.log(
            '구 레벨 고객 리스트: ================================',
            response.data.customerList
          );
          setCustomerStatusData(response.data.customerList);
          break;
        case 'district':
          console.log('구 레벨 고객 리스트:', response.data.customerList);
          setCustomerList(response.data.customerList);
          break;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
      }
      throw error;
    }
  };

  const fetchCustomerData = async (customerInfo: CustomerInfo | null) => {
    if (!currentLevel) return;
    try {
      const response = await ApiClient.post(
        '/api/getAreaCustomerInfo',
        customerInfo,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          responseType: 'json',
        }
      );

      // 응답 데이터 로깅
      console.log('API 응답 데이터:', response.data);
      console.log('customerInfo 데이터:', response.data.customerInfo);

      // 데이터가 있는 경우에만 상태 업데이트
      if (response.data.customerInfo) {
        const customerData = response.data.customerInfo;
        console.log(
          'customerData: ================================',
          customerData
        );
        setCustomerInfo(customerData);
      }

      if (response.data.deviceList) {
        setDeviceList(response.data.deviceList);
      }

      if (response.data.floorList) {
        setFloorList(response.data.floorList);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API 오류:', error.response?.data);
      }
      console.error('고객 데이터 조회 중 오류:', error);
    }
  };

  // 초기 이벤트 데이터 조회 함수
  const fetchInitialEventData = async () => {
    try {
      const response = await ApiClient.post(
        '/api/getDashBoardEventList',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          responseType: 'json',
        }
      );
      if (response.data) {
        const events = Array.isArray(response.data)
          ? response.data
          : [response.data];
        for (const event of events) {
          dispatch(setEventData(event));
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('이벤트 데이터 조회 실패:', error.response?.data);
      }
      console.error('이벤트 데이터 조회 중 오류 발생:', error);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 조회
  useEffect(() => {
    fetchInitialEventData();
  }, []);

  // currentLevel이나 selectedArea가 변경될 때 데이터 가져오기
  useEffect(() => {
    console.log('Level 변경:', currentLevel);
    console.log('Selected Area:', selectedArea);

    if (currentLevel !== 'customer') {
      fetchAreaData();
      setShowMapArea('map');
    }
  }, [currentLevel, selectedArea?.code]);

  const handleTopClick = (areaData: AreaData | null) => {
    console.log('areaData:', areaData);
    if (!areaData) return;
    let newLevel = currentLevel;
    dispatch(updateSelectedArea(areaData));

    switch (currentLevel) {
      case 'land':
        newLevel = 'city';
        dispatch(updateCurrentLevel('city'));
        break;
      case 'city':
        newLevel = 'district';
        dispatch(updateCurrentLevel('district'));
        break;
      case 'district':
        newLevel = 'customer';
        dispatch(updateCurrentLevel('customer'));
        setShowMapArea('building');
        break;
    }
    dispatch(addToHistory({ level: newLevel, area: areaData }));
  };

  const handleCustomerClick = (selectedCustomer: CustomerInfo | null) => {
    fetchCustomerData(selectedCustomer);
    dispatch(updateCurrentLevel('customer'));
    setShowMapArea('building');
    dispatch(addToHistory({ level: currentLevel, area: null }));
  };

  const handleMapClick = (
    areaType: string,
    areaData: AreaData | null,
    customerInfo: CustomerInfo | null
  ) => {
    console.log('areaType:', areaType);
    console.log('areaData:', areaData);
    console.log('customerInfo:', customerInfo);
    if (areaType === 'customer') {
      dispatch(resetToAll());
      dispatch(updateCurrentLevel(areaType));
      setShowMapArea('building');
      fetchCustomerData(customerInfo);
    } else {
      dispatch(addToHistory({ level: areaType, area: areaData }));
      dispatch(updateCurrentLevel(areaType));
      dispatch(updateSelectedArea(areaData));
    }
  };

  const handlePrevPage = (areaType: string, areaData: AreaData | null) => {
    if (currentLevel === areaType) return;
    dispatch(updateCurrentLevel(areaType));
    dispatch(updateSelectedArea(areaData));
    dispatch(resetToPreviousState());
  };

  const handlePageChange = (pageName: string) => {
    setShowMapArea(pageName);
  };

  const handleExitStatusChange = (
    pageName: string,
    floorInfo: FloorInfo | undefined
  ) => {
    console.log(floorInfo);
    setSelectedFloor(floorInfo);
    setShowMapArea(pageName);
  };

  // 지도 컴포넌트 렌더링 로직
  const renderMapContent = () => {
    switch (showMapArea) {
      case 'map':
        return (
          <MapArea
            key={`map-${eventUpdateKey}-${JSON.stringify(eventStatus)}`}
            onMapClick={handleMapClick}
            selectedArea={selectedArea}
            currentLevel={currentLevel}
            cityData={cityData}
            eventData={eventStatus}
            customerList={customerList}
            prevMap={handlePrevPage}
          />
        );
      case 'building':
        return (
          <BuildingArea
            customerInfo={customerInfo}
            floorList={floorList}
            eventData={eventStatus[eventStatus.length - 1]}
            onPageChange={handlePageChange}
            onPageExitStatusChange={handleExitStatusChange}
          />
        );
      case 'ExitStatus':
        const filteredDeviceList = deviceList.filter(
          (floor) => floor.floor_no === selectedFloor?.floor_no
        );

        return (
          <ExitStatus
            customerInfo={customerInfo}
            deviceList={filteredDeviceList}
            eventList={eventStatus}
            floorData={selectedFloor}
            handlePageChange={handlePageChange}
          />
        );
      case 'SmokeRoute':
        return <SmokeRoute />;
      case 'CctvView':
        return <CctvView />;
      default:
        return (
          <MapArea
            key={`map-${eventUpdateKey}-${JSON.stringify(eventStatus)}`}
            onMapClick={handleMapClick}
            selectedArea={selectedArea}
            currentLevel={currentLevel}
            eventData={eventStatus}
            cityData={cityData}
            customerList={customerList}
            prevMap={handlePrevPage}
          />
        );
    }
  };

  const handleEventClick = (eventData: EventData) => {
    const customerInfo: CustomerInfo = {
      contract_code: eventData.contract_code,
      client_code: eventData.client_code,
      customer_name: eventData.customer_name,
      city_code: eventData.city_code,
      district_code: eventData.district_code,
      address: eventData.floor_no.toString(),
      gps_position: null,
      manager_name: null,
      fire_tel: null,
      police_tel: null,
      emergency_tel1: null,
      emergency_tel2: null,
      emergency_tel3: null,
      contract_date: null,
    };

    fetchCustomerData(customerInfo);
    dispatch(updateCurrentLevel('customer'));
    setShowMapArea('building');
  };

  // 이벤트 컴포넌트 렌더링 로직
  const renderEventContent = () => {
    return currentLevel === 'customer' ? (
      <EventAlarm onPageChange={handleExitStatusChange} floorList={floorList}
                  customerInfo={customerInfo}/>
    ) : (
      <EventArea
        onEventClick={handleEventClick}
        onPageChange={handlePageChange}
      />
    );
  };

  useEffect(() => {
    dispatch(resetToAll());
  }, []);

  const handleEventUpdate = (newEventData: any) => {
    // 새로운 이벤트의 event_id 확인
    const newEventId = newEventData[0]?.event_id;

    // event_id가 변경된 경우에만 업데이트
    if (newEventId && newEventId !== prevEventId) {
      console.log('New event detected:', newEventId);
      setEventData(newEventData);
      setPrevEventId(newEventId);
    }
  };

  useEffect(() => {
    // URL 상태 관리
    const handleUrlState = () => {
      const currentPath = location.pathname;
      if (!currentPath.includes('dashboard')) {
        return; // dashboard 경로가 아니면 처리하지 않음
      }
    };

    handleUrlState();
  }, [location]); // location만 의존성으로 추가

  useEffect(() => {
    console.log('이벤트 상태 변경:', eventStatus);
  }, [eventStatus]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // 1. URL 파라미터 체크
        const params = new URLSearchParams(location.search);
        const level = params.get('level');
        const areaCode = params.get('area');

        // 2. 상태 초기화 방지
        if (!level && !areaCode) {
          dispatch(resetToAll());
          return;
        }

        // 3. 레벨과 지역 설정
        if (level) {
          dispatch(updateCurrentLevel(level));
          if (areaCode) {
            dispatch(
              updateSelectedArea({
                code: areaCode,
                name: '',
              })
            );
          }
        }

        // 4. 데이터 로드
        await fetchAreaData();
        await fetchInitialEventData();

        // 5. URL 파라미터 제거
        navigate(location.pathname, {
          replace: true,
          state: { level, area: areaCode },
        });
      } catch (error) {
        console.error('초기화 중 오류:', error);
      }
    };

    initializeDashboard();
  }, [location.search]); // URL 파라미터 변경 시에만 실행

  return (
    <div id='container' className='cd-main-content dashboard_area'>
      <CustomerArea
        customerStatusInfo={customerStatusData}
        customerList={customerList}
        deviceList={deviceList}
        currentLevel={currentLevel}
        onTopClick={handleTopClick}
        onCustomerClick={handleCustomerClick}
      />
      {renderMapContent()}
      {renderEventContent()}
    </div>
  );
};

export default Dashboard;
