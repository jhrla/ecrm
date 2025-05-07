import React from 'react';
import { SetupInfo } from './type/DeviceSettingInfo';

interface WirelessReceiverModalProps {
  device?: SetupInfo;
  show: boolean;
  onClose: () => void;
}

const WirelessReceiverModal: React.FC<WirelessReceiverModalProps> = ({
  device,
  show,
  onClose,
}) => {
  console.log(device);
  if (!show) return null;

  return (
    <div className='modal fade modal_sm show' style={{ display: 'block' }}>
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header modal-header-bg longBg'>
            <h5 className='modal-title'>무선수신기 정보</h5>
            <button type='button' className='close' onClick={onClose}></button>
          </div>
          <div className='modal-body'>
            <div className='row'>
              <div className='col-lg-6 col-md-12'>
                <div className='title_style black'>설정 정보</div>
                <div className='row table_type4 mg00'>
                  <table className='table'>
                    <tbody>
                      <tr>
                        <th>장치번호</th>
                        <td>{device?.Type_1 || '-'}</td>
                      </tr>
                      <tr>
                        <th>시리얼번호</th>
                        <td>{device?.SerialNumber || '-'}</td>
                      </tr>
                      <tr>
                        <th>버전</th>
                        <td>{device?.Version_1 || '-'}</td>
                      </tr>
                      <tr>
                        <th>형식승인번호</th>
                        <td>{device?.ApprovalNumber || '-'}</td>
                      </tr>
                      <tr>
                        <th>제조일자</th>
                        <td>{device?.ManufacturingDate || '-'}</td>
                      </tr>
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
                        <th>건물명</th>
                        <td>{device?.BuildingName || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='col-lg-6 col-md-12'>
                <div className='title_style black'>화재감지기 설정</div>
                <div className='row table_type4 mg00'>
                  <table className='table'>
                    <tbody>
                      <tr>
                        <th>예비 경보 사용 유무</th>
                        <td>
                          {device?.FireConfig?.PreAlarmEnable === 1
                            ? '사용'
                            : '사용안함'}
                        </td>
                      </tr>
                      <tr>
                        <th>예비 연기 농도 설정</th>
                        <td>
                          {device?.FireConfig.PreSmokeAlarmThreshold || '-'}
                        </td>
                      </tr>
                      <tr>
                        <th>예비 온도 설정</th>
                        <td>
                          {device?.FireConfig.PreTempAlarmThreshold || '-'}
                        </td>
                      </tr>
                      <tr>
                        <th>경보 온도 설정</th>
                        <td>{device?.FireConfig.TempAlarmThreshold || '-'}</td>
                      </tr>
                      <tr>
                        <th>예비 온도 상승 설정</th>
                        <td>
                          {device?.FireConfig.PreTempRiseAlarmThreshold || '-'}
                        </td>
                      </tr>
                      <tr>
                        <th>경보 온도 상승 설정</th>
                        <td>
                          {device?.FireConfig.TempRiseAlarmThreshold || '-'}
                        </td>
                      </tr>
                      <tr>
                        <th>화재 발생 판단 조건</th>
                        <td>
                          {device?.FireConfig.AlarmCondition === 0
                            ? '온도, 연기 둘 중 하나라도 만족 시 경보'
                            : '온도와 연기 모두 충족해야 경보'}
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

export default WirelessReceiverModal;
