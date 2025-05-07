import React from 'react';
import CommonTable from '../../../../components/table/CommonTable';
import CommonTableRow from '../../../../components/table/CommonTableRow';
import CommonTableColumn from '../../../../components/table/CommonTableColumn';

interface FloorInfoData {
  contract_code: string;
  client_code: string;
  customer_name: string;
  city_code: string;
  city_name: string;
  district_code: string;
  district_name: string;
  building_type: string;
  address: string;
  service_type: string;
  contract_date: string;
  contract_qty: string;
}

interface FloorInfoTableProps {
  floorInfo: FloorInfoData[];
  onRowClick: (device: FloorInfoData) => void;
}

export const FloorInfoTable = ({
  floorInfo = [],
  onRowClick,
}: FloorInfoTableProps): JSX.Element => {
  const headersName = [
    { name: '번호' },
    { name: '계약번호' },
    { name: '고객' },
    { name: '건물유형' },
    { name: '주소' },
    { name: '서비스유형' },
    { name: '설치일시' },
    { name: '설치수량' },
  ];

  return (
    <div className='mscrollTable'>
      <div className='table_type1'>
        {/* 헤더는 항상 표시 */}
        <CommonTable headersName={headersName}>
          {floorInfo.length === 0 ? (
            <CommonTableRow>
              <td colSpan={headersName.length} style={{ textAlign: 'center' }}>
                장비데이터가 없습니다.
              </td>
            </CommonTableRow>
          ) : (
            floorInfo.map((floorData, index) => (
              <CommonTableRow
                key={floorData.contract_code}
                onClick={() => onRowClick(floorData)}
              >
                <CommonTableColumn>{index + 1}</CommonTableColumn>
                <CommonTableColumn>{floorData.contract_code}</CommonTableColumn>
                <CommonTableColumn>{floorData.customer_name}</CommonTableColumn>
                <CommonTableColumn>{floorData.building_type}</CommonTableColumn>
                <CommonTableColumn>{floorData.address}</CommonTableColumn>
                <CommonTableColumn>{floorData.service_type}</CommonTableColumn>
                <CommonTableColumn>{floorData.contract_date}</CommonTableColumn>
                <CommonTableColumn>{floorData.contract_qty}</CommonTableColumn>
              </CommonTableRow>
            ))
          )}
        </CommonTable>
      </div>
    </div>
  );
};

export default FloorInfoTable;
