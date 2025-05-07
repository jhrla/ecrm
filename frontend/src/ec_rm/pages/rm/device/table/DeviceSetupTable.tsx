// src/components/DeviceTable.tsx
import React, { useState, useEffect } from 'react';
import CommonTable from '../../../../components/table/CommonTable';
import CommonTableRow from '../../../../components/table/CommonTableRow';
import CommonTableColumn from '../../../../components/table/CommonTableColumn';
import ReceiverSettingsModal from '../modal/ReceiverSettingsModal';
import WirelessReceiverModal from '../modal/WirelessReceiverModal';
import RepeaterModal from '../modal/RepeaterModal';
import ApiClient from 'ec_rm/utils/ApiClient';
import { DeviceSetupResponse } from '../modal/type/DeviceSettingInfo';
import axios from 'axios';

interface DeviceSetupInfo {
  com_id: string;
  contract_code: string;
  customer_name: string;
  ceo_name: string;
  building_type: string;
  device_name: string;
  device_id: string;
  device_type: string;
  install_date: string;
  install_address: string;
  use_status: string;
}

interface DeviceSetupTableProps {
  devicesSetup: DeviceSetupInfo[];
}

export const DeviceSetupTable = ({
  devicesSetup,
}: DeviceSetupTableProps): JSX.Element => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceSetupInfo | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceSetupData, setDeviceSetupData] =
    useState<DeviceSetupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const headersName = [
    { name: '번호' },
    { name: '계약번호' },
    { name: '고객' },
    { name: '대표자' },
    { name: '건물유형' },
    { name: '장비명' },
    { name: '장비ID' },
    { name: '설치일시' },
    { name: '설치위치' },
    { name: '상태' },
    { name: '장비설정' },
  ];

  const handleDeviceSetup = async (device: DeviceSetupInfo) => {
    setIsLoading(true);

    try {
      const now = new Date();
      const currentTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const requestData = {
        MeasuredTime: currentTime,
        ComId: device.com_id,
        DeviceId: device.device_id,
      };

      const response = await ApiClient.post('/api/getDeviceSetup', requestData);
      console.log('API Response Data:', response.data);

      const setupData = response.data.data;

      if (!setupData || !setupData.SetupInfo) {
        throw new Error('설정 정보가 없습니다.');
      }

      setSelectedDevice(device);
      setDeviceSetupData(setupData);
      setIsModalOpen(true);
    } catch (error: any) {
      console.error('API 호출 실패:', error);
      console.error('상세 에러:', {
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status,
      });
      alert(`장비 설정 정보를 가져오는데 실패했습니다. ${error.message}`);
      handleCloseModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  const renderDeviceModal = (device: DeviceSetupInfo) => {
    if (!selectedDevice || !isModalOpen || !deviceSetupData) {
      console.log('Modal conditions not met:', {
        selectedDevice: !!selectedDevice,
        isModalOpen,
        deviceSetupData: !!deviceSetupData,
      });
      return null;
    }

    // device_type 확인을 위한 로깅 추가
    const deviceType = String(deviceSetupData.SetupInfo.Type_1).split('.')[0];
    console.log('Device Type:', deviceType, typeof deviceType);

    switch (deviceType) {
      case '128':
      case '129':
        return (
          <WirelessReceiverModal
            device={deviceSetupData.SetupInfo}
            show={isModalOpen}
            onClose={handleCloseModal}
          />
        );
      case '176':
        console.log('Rendering RepeaterModal'); // 176 타입일 때 로그
        return (
          <RepeaterModal
            device={deviceSetupData.SetupInfo}
            show={isModalOpen}
            onClose={handleCloseModal}
          />
        );
      case '160':
        return (
          <ReceiverSettingsModal
            device={deviceSetupData.SetupInfo}
            show={isModalOpen}
            onClose={handleCloseModal}
          />
        );
      default:
        console.log('Unknown device type:', deviceType);
        return null;
    }
  };

  return (
    <>
      <div className='mscrollTable'>
        <div className='table_type1'>
          <CommonTable headersName={headersName}>
            {devicesSetup.map((device) => (
              <CommonTableRow key={device.contract_code + device.device_id}>
                <CommonTableColumn>{device.device_id}</CommonTableColumn>
                <CommonTableColumn>{device.contract_code}</CommonTableColumn>
                <CommonTableColumn>{device.customer_name}</CommonTableColumn>
                <CommonTableColumn>{device.ceo_name}</CommonTableColumn>
                <CommonTableColumn>{device.building_type}</CommonTableColumn>
                <CommonTableColumn>{device.device_name}</CommonTableColumn>
                <CommonTableColumn>{device.device_id}</CommonTableColumn>
                <CommonTableColumn>{device.install_date}</CommonTableColumn>
                <CommonTableColumn>{device.install_address}</CommonTableColumn>
                <CommonTableColumn>{device.use_status}</CommonTableColumn>
                <CommonTableColumn>
                  <button
                    onClick={() => handleDeviceSetup(device)}
                    style={{
                      backgroundColor: '#007bff',
                      color: '#fff',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      lineHeight: 1.2,
                    }}
                  >
                    장비설정
                  </button>
                </CommonTableColumn>
              </CommonTableRow>
            ))}
          </CommonTable>
        </div>
      </div>
      {selectedDevice && renderDeviceModal(selectedDevice)}
    </>
  );
};

export default DeviceSetupTable;
