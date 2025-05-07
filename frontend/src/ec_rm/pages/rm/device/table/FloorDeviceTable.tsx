import React, { useEffect } from 'react';
import CommonTable from '../../../../components/table/CommonTable';
import CommonTableRow from '../../../../components/table/CommonTableRow';
import CommonTableColumn from '../../../../components/table/CommonTableColumn';
import Legend from 'ec_rm/components/common/Legend';

interface FloorDeviceWithSelection {
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
  isSelected: boolean;
}

interface FloorDeviceTableProps {
  onFloorDevice: (device_id: string) => void;
  deviceList: FloorDeviceWithSelection[];
}

export const FloorDeviceTable = ({
  onFloorDevice,
  deviceList,
}: FloorDeviceTableProps): JSX.Element => {
  const headersName = [
    { name: '선택' },
    { name: '번호' },
    { name: '장비명' },
    { name: '설치위치' },
    { name: '설치일자' },
    { name: 'DeviceID' },
    { name: '시리얼번호' },
  ];

  // const isSelected = (device_id: string) => {
  //   return selectedDevice.some((eq) => eq.device_id === device_id);
  // };

  // useEffect(() => {
  //   // 전체 선택
  //   selectedDevice.forEach((selectedDevice) => {
  //     if (!isSelected(selectedDevice.device_id)) {
  //       onFloorDevice(selectedDevice.device_id); // 아직 선택되지 않은 항목을 선택
  //     }
  //   });
  // }, []);

  return (
    <div className='col-lg-5 col-md-12'>
      <div className='mt30'>
        <h3 className='color_white'>장비아이콘 범례</h3>
        <Legend />
      </div>
      <div className='mt30'>
        <h3 className='color_white'>장비설치 리스트</h3>
        <div className='table_type2 mt10'>
          <CommonTable headersName={headersName}>
            {deviceList.map((floorDevice, index) => (
              <CommonTableRow
                key={floorDevice.device_id}
                onClick={() => onFloorDevice(floorDevice.device_id)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: floorDevice.isSelected
                    ? '#e0e0e0'
                    : 'transparent',
                }}
              >
                <CommonTableColumn>
                  <input
                    type='checkbox'
                    checked={floorDevice.isSelected}
                    onChange={() => onFloorDevice(floorDevice.device_id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </CommonTableColumn>
                <CommonTableColumn>{index + 1}</CommonTableColumn>
                <CommonTableColumn>{floorDevice.device_name}</CommonTableColumn>
                <CommonTableColumn>
                  {floorDevice.install_address}
                </CommonTableColumn>
                <CommonTableColumn>
                  {floorDevice.install_date}
                </CommonTableColumn>
                <CommonTableColumn>{floorDevice.device_id}</CommonTableColumn>
                <CommonTableColumn>{floorDevice.com_id}</CommonTableColumn>
              </CommonTableRow>
            ))}
          </CommonTable>
        </div>
      </div>
    </div>
  );
};

export default FloorDeviceTable;
