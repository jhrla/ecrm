import axios from 'axios';
import CommonTable from 'ec_rm/components/table/CommonTable';
import CommonTableColumn from 'ec_rm/components/table/CommonTableColumn';
import CommonTableRow from 'ec_rm/components/table/CommonTableRow';
import ApiClient from 'ec_rm/utils/ApiClient';
import React, { useState } from 'react';

interface DeviceInfo {
  contract_code: string | null;
  client_code: string;
  device_cnt: string;
  com_id: string;
  parent_id: string;
  terminal_cnt: string;
  device_id: string;
  device_type: string;
  device_name: string;
  install_date: string;
  install_address: string;
  floor_no: string;
}

interface FloorDeviceModalProps {
  deviceList: DeviceInfo[];
  onClose: () => void; // 모달을 닫는 함수 prop으로 받음
}

export const FloorDeviceModal: React.FC<FloorDeviceModalProps> = ({
  deviceList,
  onClose,
}) => {
  const headersName = [
    { name: '번호' },
    { name: 'COM_ID' },
    { name: '장비ID' },
    { name: '장비명' },
    { name: '설치층' },
    { name: '설치장소' },
  ];

  const saveDeviceInfo = async (deviceInfo: DeviceInfo[]) => {
    try {
      // 페이지 번호를 params에 포함하여 서버로 전달
      const response = await ApiClient.post('/api/setDevcieList', deviceInfo, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('정상처리 되었습니다.');
      onClose();
    } catch (error) {
      console.error('Error fetching Devices:', error);
    }
  };

  return (
    <div
      className='modal fade modal_sm show'
      id='FloorFileModal'
      style={{ display: 'block' }}
    >
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <form>
            <div className='modal-header modal-header-bg longBg'>
              <h5 className='modal-title'>등록장비 리스트</h5>
              <button
                type='button'
                className='close'
                onClick={onClose}
                aria-label='Close'
              ></button>
            </div>
            <div className='modal-body pb00'>
              <div className='mscrollTable'>
                <div className='table_type1'>
                  <CommonTable headersName={headersName}>
                    {deviceList.length === 0 ? (
                      <CommonTableRow>
                        <td
                          colSpan={headersName.length}
                          style={{ textAlign: 'center' }}
                        >
                          장비데이터가 없습니다.
                        </td>
                      </CommonTableRow>
                    ) : (
                      deviceList.map((floorInfo, index) => (
                        <CommonTableRow
                          key={floorInfo.com_id + '_' + floorInfo.device_id}
                        >
                          <CommonTableColumn>{index + 1}</CommonTableColumn>
                          <CommonTableColumn>
                            {floorInfo.com_id}
                          </CommonTableColumn>
                          <CommonTableColumn>
                            {floorInfo.device_id}
                          </CommonTableColumn>
                          <CommonTableColumn>
                            {floorInfo.device_name}
                          </CommonTableColumn>
                          <CommonTableColumn>
                            {floorInfo.floor_no}
                          </CommonTableColumn>
                          <CommonTableColumn>
                            {floorInfo.install_address}
                          </CommonTableColumn>
                        </CommonTableRow>
                      ))
                    )}
                  </CommonTable>
                </div>
              </div>
            </div>
            <div className='modal-footer blue'>
              <button
                type='button'
                className='btn btn-primary'
                onClick={() => saveDeviceInfo(deviceList)}
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FloorDeviceModalProps;
