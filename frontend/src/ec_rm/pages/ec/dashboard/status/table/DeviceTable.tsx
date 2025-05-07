// src/components/EquipmentTable.tsx
import React from 'react';
import CommonTable from '../../../../../components/table/CommonTable';
import CommonTableRow from '../../../../../components/table/CommonTableRow';
import CommonTableColumn from '../../../../../components/table/CommonTableColumn';
import { DeviceInfo } from '../../interface/DashboardType';

interface CommonTableProps {
  deviceInfo: DeviceInfo[];
  className?: string;
}

const DeviceTable: React.FC<CommonTableProps> = ({
  deviceInfo = [],
  className = '',
}) => {
  //const divStyle = type === 'top' ? 'table_type5 brown' : 'table_type5';

  const headersName = [
    { name: '장비명' },
    { name: '장비ID' },
    { name: '설치층' },
    { name: '설치위치' },
  ];

  return (
    <div className='c_cont'>
      <div className='table_type5 brown'>
        <div className='table table-hover'>
          <CommonTable headersName={headersName} className='table-light'>
            {deviceInfo.length > 0 ? (
              deviceInfo.map((device) => (
                <CommonTableRow key={device.com_id + '_' + device.device_id}>
                  <CommonTableColumn>{device.device_name}</CommonTableColumn>
                  <CommonTableColumn>{device.device_id}</CommonTableColumn>
                  <CommonTableColumn>{device.floor_no}</CommonTableColumn>
                  <CommonTableColumn>
                    {device.install_address}
                  </CommonTableColumn>
                </CommonTableRow>
              ))
            ) : (
              <CommonTableRow>
                <CommonTableColumn colSpan={headersName.length}>
                  데이터가 없습니다
                </CommonTableColumn>
              </CommonTableRow>
            )}
          </CommonTable>
        </div>
      </div>
    </div>
  );
};

export default DeviceTable;
