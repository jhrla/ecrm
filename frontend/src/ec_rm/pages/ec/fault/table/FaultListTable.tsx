import React from 'react';
import CommonTable from '../../../../components/table/CommonTable';
import CommonTableRow from '../../../../components/table/CommonTableRow';
import CommonTableColumn from '../../../../components/table/CommonTableColumn';

interface FaultInfo {
  service_type: string;
  event_kind: number;
  contract_code: string;
  customer_name: string;
  address: string;
  event_msg: string;
  device_name: string;
  device_id: string;
  event_time: string;
  event_id: number;
  device_type: string;
  event_name: string;
  sms_send_time: string;
  recover_action_time: string;
  recover_time: string;
}

interface FaultListTableProps {
  faultInfo: FaultInfo[];
  onFaultClick: (event_id: number) => void;
}

export const FaultListTable: React.FC<FaultListTableProps> = ({
  faultInfo = [],
  onFaultClick,
}) => {
  const headersName = [
    { name: '서비스' },
    { name: '계약번호' },
    { name: '고객명' },
    { name: '발생위치' },
    { name: '장비' },
    { name: '장치ID' },
    { name: '발생시간' },
    { name: '장애 구분' },
    { name: '복구시간' },
    { name: '조치내용' },
  ];

  return (
    <div className='mscrollTable'>
      <div className='table_type1'>
        {/* 헤더는 항상 표시 */}
        <CommonTable headersName={headersName}>
          {faultInfo.length === 0 ? (
            <CommonTableRow>
              <td colSpan={headersName.length} style={{ textAlign: 'center' }}>
                장비데이터가 없습니다.
              </td>
            </CommonTableRow>
          ) : (
            faultInfo.map((faultInfo, index) => (
              <CommonTableRow key={faultInfo.event_id}>
                <CommonTableColumn>{faultInfo.service_type}</CommonTableColumn>
                <CommonTableColumn>{faultInfo.contract_code}</CommonTableColumn>
                <CommonTableColumn>{faultInfo.customer_name}</CommonTableColumn>
                <CommonTableColumn>{faultInfo.event_msg}</CommonTableColumn>
                <CommonTableColumn>{faultInfo.device_name}</CommonTableColumn>
                <CommonTableColumn>{faultInfo.device_id}</CommonTableColumn>
                <CommonTableColumn>{faultInfo.event_time}</CommonTableColumn>
                <CommonTableColumn>{faultInfo.event_name}</CommonTableColumn>
                <CommonTableColumn>{faultInfo.recover_time}</CommonTableColumn>
                <CommonTableColumn>
                  <button
                    style={{
                      backgroundColor: '#007bff',
                      color: '#fff',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      lineHeight: 1.2,
                    }}
                    onClick={() => onFaultClick(faultInfo.event_id)}
                  >
                    조치내용
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

export default FaultListTable;
