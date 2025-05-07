// src/components/DeviceTable.tsx
import React from 'react';
import CommonTable from '../../../../components/table/CommonTable';
import CommonTableRow from '../../../../components/table/CommonTableRow';
import CommonTableColumn from '../../../../components/table/CommonTableColumn';

interface PeriodicReportInfo {
  building_type: string;
  city_name: string;
  co: string;
  contract_code: string;
  customer_name: string;
  device_id: string;
  device_name: string;
  event_time: string;
  fire_event: string;
  humidity: string;
  install_address: string;
  log_seq: number;
  smoke_density: string;
  temp: string;
}

interface PeriodicReportProps {
  periodicReportInfos: PeriodicReportInfo[];
  //onFireSafety: (equipmentID: string) => void;
}

export const PeriodicReportTable = ({
  periodicReportInfos = [],
}: //onFireSafety,
PeriodicReportProps): JSX.Element => {
  console.log(periodicReportInfos);

  const headersName = [
    { name: '번호' },
    { name: '계약번호' },
    { name: '지역' },
    { name: '고객' },
    { name: '건물유형' },
    { name: '장비명' },
    { name: '설치위치' },
    { name: '장비ID' },
    { name: '수집시간' },
    { name: '온도(℃)' },
    { name: '연기(%)' },
    { name: '습도(%)' },
    { name: '일산화탄소(%)' },
    { name: '이벤트' },
  ];

  return (
    <div className='mscrollTable'>
      <div className='table_type1'>
        <CommonTable headersName={headersName}>
          {periodicReportInfos.length === 0 ? (
            <CommonTableRow>
              <td colSpan={headersName.length} style={{ textAlign: 'center' }}>
                이벤트 데이터가 없습니다.
              </td>
            </CommonTableRow>
          ) : (
            periodicReportInfos.map((periodicReport, index) => (
              <CommonTableRow key={periodicReport.log_seq + '_' + index}>
                <CommonTableColumn>{index + 1}</CommonTableColumn>
                <CommonTableColumn>
                  {periodicReport.contract_code}
                </CommonTableColumn>
                <CommonTableColumn>
                  {periodicReport.city_name}
                </CommonTableColumn>
                <CommonTableColumn>
                  {periodicReport.customer_name}
                </CommonTableColumn>
                <CommonTableColumn>
                  {periodicReport.building_type}
                </CommonTableColumn>
                <CommonTableColumn>
                  {periodicReport.device_name}
                </CommonTableColumn>
                <CommonTableColumn>
                  {periodicReport.install_address}
                </CommonTableColumn>
                <CommonTableColumn>
                  {periodicReport.device_id}
                </CommonTableColumn>
                <CommonTableColumn>
                  {periodicReport.event_time}
                </CommonTableColumn>
                <CommonTableColumn>{periodicReport.temp}</CommonTableColumn>
                <CommonTableColumn>
                  {periodicReport.smoke_density}
                </CommonTableColumn>
                <CommonTableColumn>{periodicReport.humidity}</CommonTableColumn>
                <CommonTableColumn>{periodicReport.co}</CommonTableColumn>
                <CommonTableColumn>
                  {periodicReport.fire_event}
                </CommonTableColumn>
              </CommonTableRow>
            ))
          )}
        </CommonTable>
      </div>
    </div>
  );
};

export default PeriodicReportTable;
