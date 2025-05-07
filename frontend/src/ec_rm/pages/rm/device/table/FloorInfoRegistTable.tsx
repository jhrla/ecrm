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

interface FloorInfoRegistTableProps {
  floorInfo: FloorInfoData[];
  onDeviceClick: (floorInfo: FloorInfoData) => void;
  onFloorClick: (floorInfo: FloorInfoData) => void;
}

export const FloorInfoRegistTable = ({
  floorInfo = [],
  onDeviceClick,
  onFloorClick,
}: FloorInfoRegistTableProps): JSX.Element => {
  const headersName = [
    { name: '번호' },
    { name: '계약번호' },
    { name: '고객' },
    { name: '건물유형' },
    { name: '주소' },
    { name: '서비스유형' },
    { name: '계약일자' },
    { name: '장비정보' },
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
              <CommonTableRow key={floorData.contract_code}>
                <CommonTableColumn>{index + 1}</CommonTableColumn>
                <CommonTableColumn>
                  <button
                    onClick={() => onFloorClick(floorData)}
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
                    {floorData.contract_code}
                  </button>
                </CommonTableColumn>
                <CommonTableColumn>{floorData.customer_name}</CommonTableColumn>
                <CommonTableColumn>{floorData.building_type}</CommonTableColumn>
                <CommonTableColumn>{floorData.address}</CommonTableColumn>
                <CommonTableColumn>{floorData.service_type}</CommonTableColumn>
                <CommonTableColumn>{floorData.contract_date}</CommonTableColumn>
                <CommonTableColumn>
                  <button
                    onClick={() => onDeviceClick(floorData)}
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
                    장비정보 불러오기
                  </button>
                </CommonTableColumn>
              </CommonTableRow>
            ))
          )}
        </CommonTable>
      </div>
    </div>
  );
};

export default FloorInfoRegistTable;
