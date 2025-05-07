import React, { useState } from 'react';

import { SetupInfo } from './type/DeviceSettingInfo';

interface RepeaterModalProps {
  device?: SetupInfo;
  show: boolean;
  onClose: () => void;
}

interface StopSwitch {
  Name: string;
  Index: number;
}

export const RepeaterModal: React.FC<RepeaterModalProps> = ({
  device,
  show,
  onClose,
}) => {
  console.log('RepeaterModal rendering:', { device, show, onClose });

  // 사용유무 표시 함수
  const getUseStatus = (value: any) => {
    return value === '0' ? '사용안함' : value === '1' ? '사용함' : '-';
  };

  if (!show) return null;

  return (
    <div className='modal fade modal_sm show' style={{ display: 'block' }}>
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header modal-header-bg longBg'>
            <h5 className='modal-title'>수신기 정보</h5>
            <button type='button' className='close' onClick={onClose}></button>
          </div>
          <div className='modal-body'>
            <div className='row'>
              <div className='col-lg-4 col-md-12'>
                <div className='title_style black'>중계기 설정 정보</div>
                <div className='row table_type4 mg00'>
                  <table className='table'>
                    <tbody>
                      <tr>
                        <th>설치일자</th>
                        <td>{device?.InstallDate || '-'}</td>
                      </tr>
                      <tr>
                        <th>설치위치</th>
                        <td>{device?.InstallAddress || '-'}</td>
                      </tr>
                      <tr>
                        <th>설치층</th>
                        <td>{device?.InstallFloor || '-'}</td>
                      </tr>
                      <tr>
                        <th>중계기와 감지기간 채널1</th>
                        <td>{device?.EDChannel1 || '-'}</td>
                      </tr>
                      <tr>
                        <th>중계기와 중계기간 채널2</th>
                        <td>{device?.EDChannel2 || '-'}</td>
                      </tr>
                      <tr>
                        <th>중계기와 감지기간 Sniff채널</th>
                        <td>{device?.SniffChannel || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='col-lg-8 col-md-12'>
                <div className='title_style black'>중계기 사이렌 설정 정보</div>
                <div className='row table_type4 mg00'>
                  <table className='table'>
                    <tbody>
                      <tr>
                        <th>연동정지 스위치입력시 사이렌 정지설정</th>
                        <td>
                          {device?.Siren.StopSwitch === 0
                            ? '사용안함'
                            : device?.Siren.StopSwitch}
                        </td>
                      </tr>
                      <tr>
                        <th>입력 신호시 사이렌 전지설정</th>
                        <td>
                          {device?.Siren.InputStop === 0 ? '사용안함' : 'OFF'}
                        </td>
                      </tr>
                      <tr>
                        <th>Input Stop List</th>
                        <td>
                          {device?.Siren.InputStopList
                            ? device?.Siren.InputStopList.map(
                                (item: string, index: number) => (
                                  <div key={index}>
                                    {item} ({index}번)
                                  </div>
                                )
                              )
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <th>화재 감지 시 사이렌설정</th>
                        <td>
                          {device?.Siren.FireCondition === 0
                            ? '사용안함'
                            : device?.Siren.FireCondition === 1
                              ? '화재 감지기 ON'
                              : '설정층 범위에서 화재 감지기 ON'}
                        </td>
                      </tr>
                      <tr>
                        <th>
                          FireCondition이 2일경우 유효 화재 층 범위 Low값 설정
                        </th>
                        <td>
                          {device?.Siren?.FireFloorLow === 0
                            ? '사용안함'
                            : (device?.Siren?.FireFloorLow ?? 0) < 0
                              ? '지하' +
                                (device?.Siren?.FireFloorLow ?? 0) * -1 +
                                '층'
                              : (device?.Siren?.FireFloorLow ?? 0) + '층'}
                        </td>
                      </tr>
                      <tr>
                        <th>
                          FireCondition이 2일경우 유효 화재 층 범위 High값 설정
                        </th>
                        <td>
                          {device?.Siren?.FireFloorHigh === 0
                            ? '사용안함'
                            : (device?.Siren?.FireFloorHigh ?? 0) < 0
                              ? '지하' +
                                (device?.Siren?.FireFloorHigh ?? 0) * -1 +
                                '층'
                              : (device?.Siren?.FireFloorHigh ?? 0) + '층'}
                        </td>
                      </tr>
                      <tr>
                        <th>가스 감지시 사이렌 설정</th>
                        <td>
                          {device?.Siren.GasCondition === 0
                            ? '사용안함'
                            : device?.Siren.GasCondition === 1
                              ? '가스 감지기 ON'
                              : '설정층 범위에서 가스 감지기 ON'}
                        </td>
                      </tr>
                      <tr>
                        <th>GasCondition이 2일 경우 유효가스 층범위 Low설정</th>
                        <td>
                          {device?.Siren?.GasFloorLow === 0
                            ? '사용안함'
                            : (device?.Siren?.GasFloorLow ?? 0) < 0
                              ? '지하' +
                                (device?.Siren?.GasFloorLow ?? 0) * -1 +
                                '층'
                              : (device?.Siren?.GasFloorLow ?? 0) + '층'}
                        </td>
                      </tr>
                      <tr>
                        <th>
                          GasCondition이 2일 경우 유효가스 층범위 High설정
                        </th>
                        <td>
                          {device?.Siren?.GasFloorHigh === 0
                            ? '사용안함'
                            : (device?.Siren?.GasFloorHigh ?? 0) < 0
                              ? '지하' +
                                (device?.Siren?.GasFloorHigh ?? 0) * -1 +
                                '층'
                              : (device?.Siren?.GasFloorHigh ?? 0) + '층'}
                        </td>
                      </tr>
                      <tr>
                        <th>특정입력 그룹신호시 사이렌설정</th>
                        <td>
                          {device?.Siren.InputAction === 0
                            ? '사용안함'
                            : '사이렌 ON'}
                        </td>
                      </tr>
                      <tr>
                        <th>
                          Input Action 설정에 따라 사용됨 최대 16개 DeviceId
                          리스트(A)
                        </th>
                        <td>
                          {device?.Siren.InputAList
                            ? device?.Siren.InputAList.map(
                                (item: string, index: number) => (
                                  <div key={index}>
                                    {index} : {item}
                                  </div>
                                )
                              )
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <th>
                          Input Action 설정에 따라 사용됨 최대 16개 DeviceId
                          리스트(B)
                        </th>
                        <td>
                          {device?.Siren.InputBList
                            ? device?.Siren.InputBList.map(
                                (item: string, index: number) => (
                                  <div key={index}>
                                    {index} : {item}
                                  </div>
                                )
                              )
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <th>특정입력 그룹신호시 사이렌설정</th>
                        <td>
                          {device?.Siren.GroupInputAction === 0
                            ? '사용안함'
                            : '사이렌 ON'}
                        </td>
                      </tr>
                      <tr>
                        <th>
                          Group Input Action 설정에 따라 사용됨 최대 16개
                          DeviceId 리스트(A)
                        </th>
                        <td>
                          {device?.Siren.InputGroupAList
                            ? device?.Siren.InputGroupAList.map(
                                (item, index) => (
                                  <div key={index}>
                                    {index} : {item}
                                  </div>
                                )
                              )
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <th>
                          Group Input Action 설정에 따라 사용됨 최대 16개
                          DeviceId 리스트(B)
                        </th>
                        <td>
                          {device?.Siren.InputGroupBList
                            ? device?.Siren.InputGroupBList.map(
                                (item, index) => (
                                  <div key={index}>
                                    {index} : {item}
                                  </div>
                                )
                              )
                            : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className='modal-footer'>
            <button type='button' className='btn btn-clear' onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepeaterModal;
