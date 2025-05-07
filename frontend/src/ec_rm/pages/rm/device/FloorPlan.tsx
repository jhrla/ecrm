import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import FloorCanvas from './floorplan/FloorCanvas';
import PlanInfoArea from './searchbar/PlanInfoArea';
import FloorDeviceTable from './table/FloorDeviceTable';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiClient from 'ec_rm/utils/ApiClient';

interface CustomerInfo {
  contract_code: string;
  client_code: string;
  customer_name: string;
  city_code: string;
  city_name: string;
  district_code: string;
  district_name: string;
  building_type: string;
}

interface FloorDevice {
  client_code: string;
  contract_code: string;
  floor_no: number;
  device_id: string;
  com_id: string;
  device_type: string;
  device_name: string;
  install_address: string;
  install_date: string;
  install_position: string | null;
}

interface FloorDeviceWithSelection extends FloorDevice {
  isSelected: boolean;
}

interface FloorList {
  floor_no: number;
  floor_name: string;
  file_path: string;
}

export const FloorPlan = (): JSX.Element => {
  const [selectedFloor, setSelectedFloor] = useState<FloorList | null>(null);
  const [floorList, setFloorList] = useState<FloorList[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [deviceList, setDeviceList] = useState<FloorDeviceWithSelection[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<FloorDevice[]>([]);

  const location = useLocation();
  const navigate = useNavigate();

  // location.state가 undefined일 수 있으므로 방어 코드 작성
  useEffect(() => {
    if (location.state) {
      setCustomerInfo(location.state);
    } else {
      console.error('No floorInfo found in location.state');
    }
  }, [location.state]);

  useEffect(() => {
    if (customerInfo) {
      fetchDeviceList(customerInfo);
    }
  }, [customerInfo]);

  const fetchDeviceList = async (customerInfo: CustomerInfo) => {
    try {
      const response = await ApiClient.post(
        '/api/getFloorPlanInfo',
        customerInfo,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(response.data);

      setFloorList(response.data.floorList);
      setSelectedFloor(response.data.floorList[0]);

      setDeviceList(
        response.data.floorDeviceList.map((device: FloorDevice) => ({
          ...device,
          isSelected: true,
        }))
      );
    } catch (error) {
      console.error('Error fetching Devices:', error);
    }
  };

  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetValue = Number(e.target.value);
    const selectedOption = floorList.find(
      (option) => option.floor_no === targetValue // floor_no가 숫자이므로 숫자끼리 비교
    );

    if (selectedOption) {
      setSelectedFloor(selectedOption);
    }
  };

  const handleFloorDevice = (device_id: string) => {
    setDeviceList((prevList) => {
      return prevList.map((device) => {
        if (device.device_id === device_id) {
          console.log(device);
          return { ...device, isSelected: !device.isSelected };
        }
        return device;
      });
    });
  };

  const filteredDeviceList = useMemo(() => {
    if (!selectedFloor) return [];
    return deviceList.filter(
      (device) => device.floor_no === selectedFloor.floor_no
    );
  }, [deviceList, selectedFloor]);

  const selectedDevices = useMemo(() => {
    return filteredDeviceList.filter((device) => device.isSelected);
  }, [filteredDeviceList]);

  const handleSelectedDeviceUpdate = (updatedDevices: FloorDevice[]) => {
    const updatedDevicesWithPosition = deviceList.map((device) => {
      // deviceList에서 device_id가 일치하는 장치를 찾음
      const matchedDevice = updatedDevices.find(
        (d) => d.device_id === device.device_id
      );

      // matchedDevice가 존재하고 install_position이 있을 때만 업데이트
      if (matchedDevice) {
        device.install_position = matchedDevice.install_position;
      }
      // 일치하는 장치가 없으면 원래 device 반환
      return device;
    });

    setSelectedDevice([...updatedDevices]); // 부모에서 상태를 업데이트
  };

  const handleSaveDevicePosition = async () => {
    const response = await ApiClient.post(
      '/api/updateFloorDevice',
      selectedDevice,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    alert('정상처리 되었습니다.');
  };

  const handleBackPage = () => {
    navigate(-1);
  };

  return (
    <div className='inner'>
      {customerInfo && (
        <PlanInfoArea customerInfo={customerInfo} onBackPage={handleBackPage} />
      )}
      <div className='product_area'>
        <div className='row'>
          <FloorCanvas
            selectedFloor={selectedFloor}
            floorList={floorList}
            selectedDevice={selectedDevices}
            onSelectedFloor={handleFloorChange}
            onSelectedDeviceUpdate={handleSelectedDeviceUpdate}
            onSaveDevicePosition={handleSaveDevicePosition}
          />
          <FloorDeviceTable
            deviceList={filteredDeviceList}
            onFloorDevice={handleFloorDevice}
          />
        </div>
      </div>
    </div>
  );
};

export default FloorPlan;
