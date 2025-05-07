import React from 'react';
import CommonTable from '../../../../components/table/CommonTable';
import CommonTableRow from '../../../../components/table/CommonTableRow';
import CommonTableColumn from '../../../../components/table/CommonTableColumn';

interface EventInfo {
  service_type: string;
  event_kind: string;
  contract_code: string;
  customer_name: string;
  address: string;
  event_msg: string;
  device_name: string;
  device_id: string;
  event_time: string;
  event_id: string;
  device_type: string;
  event_name: string;
  sms_send_time: string;
  recover_action_time: string;
  recover_time: string;
}

interface EventListTableProps {
  eventList: EventInfo[];
}

export const EventListTable: React.FC<EventListTableProps> = ({
  eventList = [],
}) => {
  const headersName = [
    { name: '서비스' },
    { name: '등급' },
    { name: '계약번호' },
    { name: '고객명' },
    { name: '발생위치' },
    { name: '장비' },
    { name: '장치ID' },
    { name: '발생시간' },
    { name: '이벤트구분' },
    { name: '[SMS발송] 시간' },
    { name: '[확인 및 조치] 시간' },
    { name: '복구시간' },
  ];

  return (
    <div className='mscrollTable'>
      <div className='table_type1'>
        {/* 헤더는 항상 표시 */}
        <CommonTable headersName={headersName}>
          {eventList.length === 0 ? (
            <CommonTableRow>
              <td colSpan={headersName.length} style={{ textAlign: 'center' }}>
                이벤트 데이터가 없습니다.
              </td>
            </CommonTableRow>
          ) : (
            eventList.map((eventInfo, index) => (
              <CommonTableRow key={eventInfo.event_id}>
                <CommonTableColumn>{eventInfo.service_type}</CommonTableColumn>
                <CommonTableColumn>
                  {eventInfo.event_kind == '1' ? '경보' : '주의보'}
                </CommonTableColumn>
                <CommonTableColumn>{eventInfo.contract_code}</CommonTableColumn>
                <CommonTableColumn>{eventInfo.customer_name}</CommonTableColumn>
                <CommonTableColumn>{eventInfo.event_msg}</CommonTableColumn>
                <CommonTableColumn>{eventInfo.device_name}</CommonTableColumn>
                <CommonTableColumn>{eventInfo.device_id}</CommonTableColumn>
                <CommonTableColumn>{eventInfo.event_time}</CommonTableColumn>
                <CommonTableColumn>{eventInfo.event_name}</CommonTableColumn>
                <CommonTableColumn>{eventInfo.sms_send_time}</CommonTableColumn>
                <CommonTableColumn>
                  {eventInfo.recover_action_time}
                </CommonTableColumn>
                <CommonTableColumn>{eventInfo.recover_time}</CommonTableColumn>
              </CommonTableRow>
            ))
          )}
        </CommonTable>
      </div>
    </div>
  );
};

export default EventListTable;
