export interface SirenConfig {
  StopSwitch: number;
  InputStop: number;
  InputStopList: string[];
  FireCondition: number;
  FireFloorLow: number;
  FireFloorHigh: number;
  GasCondition: number;
  GasFloorLow: number;
  GasFloorHigh: number;
  InputAction: number;
  InputAList: string[];
  InputBList: string[];
  GroupInputAction: number;
  InputGroupAList: number[];
  InputGroupBList: number[];
}

export interface FireConfig {
  PreAlarmEnable: number;
  PreSmokeAlarmThreshold: number;
  SmokeAlarmThreshold: number;
  PreTempAlarmThreshold: number;
  TempAlarmThreshold: number;
  PreTempRiseAlarmThreshold: number;
  TempRiseAlarmThreshold: number;
  AlarmCondition: number;
}

export interface SetupInfo {
  Type_1: number;
  SerialNumber: string;
  Version_1: string;
  ApprovalNumber: string;
  ManufacturingDate: string;
  InstallDate: string;
  InstallAddress: string;
  BuildingName: string;
  InstallFloor: number;
  InputCount: number;
  InputIdList: number[];
  OutputCount: number;
  OutputIdList: number[];
  RfEdCount: number;
  RfEdIdList: number[];
  RfRepeaterCount: number;
  RfRepeaterIdList: number[];
  ComRepeaterCount: number;
  ComRepeaterIdList: number[];
  APChannel: number;
  EDChannel1: number;
  EDChannel2: number;
  SniffChannel: number;
  RfPower: number;
  ED1RfPower: number;
  ED2RfPower: number;
  AccumTime: number;
  AccumMaxCount: number;
  AutoRecovery: number;
  PreFireEnable: number;
  StopSwitchList: any[];
  ContractInfo: string;
  LanEn: number;
  Ip: string;
  Netmask: string;
  Gateway: string;
  DhcpEn: number;
  AutoDns: number;
  DnsIp: string;
  SubDnsIp: string;
  AutoNegoiate: number;
  WifiEn: number;
  WifiSSID: string;
  WifiPassEn: number;
  WifiPass: string;
  WifiDhcpEn: number;
  WifiIp: string;
  WifiNetmask: string;
  WifiGateway: string;
  ServerAddress: string;
  ServerPort: number;
  Group_1: number;
  MccList: any[];
  Siren: SirenConfig;
  FireConfig: FireConfig;
}

export interface DeviceSetupResponse {
  MeasuredTime: string;
  ComId: string;
  DeviceId: string;
  ErrorCode: number;
  SetupInfo: SetupInfo;
}
