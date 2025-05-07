import React from 'react';
import { SetupInfo } from './type/DeviceSettingInfo';

interface ReceiverSettingsModalProps {
  device?: SetupInfo;
  show: boolean;
  onClose: () => void;
}

interface StopSwitch {
  Name: string;
  Index: number;
}

const ReceiverSettingsModal: React.FC<ReceiverSettingsModalProps> = ({
  device,
  show,
  onClose,
}) => {
  if (!show) return null;

  // 사용유무 표시 함수
  const getUseStatus = (value: any) => {
    return value === '0' ? '사용안함' : value === '1' ? '사용함' : '-';
  };

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
                        <th>FW 버전</th>
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
                      <tr>
                        <th>입력수량</th>
                        <td>{device?.InputCount || '-'}</td>
                      </tr>
                      <tr>
                        <th>출력수량</th>
                        <td>{device?.OutputCount || '-'}</td>
                      </tr>
                      <tr>
                        <th>단말수량</th>
                        <td>{device?.RfEdCount || '-'}</td>
                      </tr>
                      <tr>
                        <th>무선 중계기 수량</th>
                        <td>{device?.RfRepeaterCount || '-'}</td>
                      </tr>
                      <tr>
                        <th>유선 중계기 수량</th>
                        <td>{device?.ComRepeaterCount || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='col-lg-4 col-md-12'>
                <div className='row table_type4 mg00'>
                  <table className='table'>
                    <tbody>
                      <tr>
                        <th>수신기와 중계기간 채널</th>
                        <td>{device?.APChannel || '-'}</td>
                      </tr>
                      <tr>
                        <th>수신기와 감지기간 채널1</th>
                        <td>{device?.EDChannel1 || '-'}</td>
                      </tr>
                      <tr>
                        <th>수신기와 중계기간 채널2</th>
                        <td>{device?.EDChannel2 || '-'}</td>
                      </tr>
                      <tr>
                        <th>수신기와 감지기간 Sniff채널</th>
                        <td>{device?.SniffChannel || '-'}</td>
                      </tr>
                      <tr>
                        <th>무선 채널 출력 세기</th>
                        <td>{device?.RfPower || '-'}</td>
                      </tr>
                      <tr>
                        <th>채널 1 출력 세기</th>
                        <td>{device?.ED1RfPower || '-'}</td>
                      </tr>
                      <tr>
                        <th>채널 2 출력 세기</th>
                        <td>{device?.ED2RfPower || '-'}</td>
                      </tr>
                      <tr>
                        <th>축적시간</th>
                        <td>{device?.AccumTime || '-'}</td>
                      </tr>
                      <tr>
                        <th>최대 축적 수량</th>
                        <td>{device?.AccumMaxCount || '-'}</td>
                      </tr>
                      <tr>
                        <th>자동복구 사용유무</th>
                        <td>{getUseStatus(device?.AutoRecovery)}</td>
                      </tr>
                      <tr>
                        <th>예비화재 사용유무</th>
                        <td>{getUseStatus(device?.PreFireEnable)}</td>
                      </tr>
                      <tr>
                        <th>연동 정지 스위치</th>
                        <td>
                          {device?.StopSwitchList ? (
                            <div>
                              {device.StopSwitchList.map(
                                (item: StopSwitch, index: number) => (
                                  <div key={index}>
                                    {item.Name} ({item.Index}번)
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>계약정보</th>
                        <td>{device?.ContractInfo || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='col-lg-4 col-md-12'>
                <div className='row table_type4 mg00'>
                  <table className='table'>
                    <tbody>
                      <tr>
                        <th>LAN 사용유무</th>
                        <td>{getUseStatus(device?.LanEn)}</td>
                      </tr>
                      <tr>
                        <th>IP</th>
                        <td>{device?.Ip || '-'}</td>
                      </tr>
                      <tr>
                        <th>Netmask</th>
                        <td>{device?.Netmask || '-'}</td>
                      </tr>
                      <tr>
                        <th>Gateway</th>
                        <td>{device?.Gateway || '-'}</td>
                      </tr>
                      <tr>
                        <th>DHCP 사용유무</th>
                        <td>{getUseStatus(device?.DhcpEn)}</td>
                      </tr>
                      <tr>
                        <th>AutoDns</th>
                        <td>{getUseStatus(device?.AutoDns)}</td>
                      </tr>
                      <tr>
                        <th>DNS IP</th>
                        <td>{device?.DnsIp || '-'}</td>
                      </tr>
                      <tr>
                        <th>보조 DNS IP</th>
                        <td>{device?.SubDnsIp || '-'}</td>
                      </tr>
                      <tr>
                        <th>Auto Negotiate</th>
                        <td>{getUseStatus(device?.AutoNegoiate)}</td>
                      </tr>
                      <tr>
                        <th>WiFi 사용유무</th>
                        <td>{getUseStatus(device?.WifiEn)}</td>
                      </tr>
                      <tr>
                        <th>WiFi SSID</th>
                        <td>{device?.WifiSSID || '-'}</td>
                      </tr>
                      <tr>
                        <th>WiFi 비밀번호 사용</th>
                        <td>{getUseStatus(device?.WifiPassEn)}</td>
                      </tr>
                      <tr>
                        <th>WiFi 비밀번호</th>
                        <td>{device?.WifiPass || '-'}</td>
                      </tr>
                      <tr>
                        <th>WiFi DHCP 사용</th>
                        <td>{getUseStatus(device?.WifiDhcpEn)}</td>
                      </tr>
                      <tr>
                        <th>WiFi IP</th>
                        <td>{device?.WifiIp || '-'}</td>
                      </tr>
                      <tr>
                        <th>WiFi Gateway</th>
                        <td>{device?.WifiGateway || '-'}</td>
                      </tr>
                      <tr>
                        <th>서버 주소</th>
                        <td>{device?.ServerAddress || '-'}</td>
                      </tr>
                      <tr>
                        <th>서버 포트</th>
                        <td>{device?.ServerPort || '-'}</td>
                      </tr>
                      <tr>
                        <th>MCC 목록</th>
                        <td>{device?.MccList?.join(', ') || '-'}</td>
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

export default ReceiverSettingsModal;
