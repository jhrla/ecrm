// 지도 지역정보 구조체
export interface AreaData {
  name: string;
  code: string;
}

export interface CustomerStatusInfo {
  name: string;
  code: string;
  center: string;
  count: number;
}

export interface CustomerInfo {
  contract_code: string | null;
  client_code: string | null;
  customer_name: string | null;
  address: string | null;
  city_code: string | null;
  district_code: string | null;
  city_name?: string | null;
  district_name?: string | null;
  building_type?: string | null;
  service_type?: string | null;
  gps_position: string | null;
  manager_name: string | null;
  fire_tel: string | null;
  police_tel: string | null;
  emergency_tel1: string | null;
  emergency_tel2: string | null;
  emergency_tel3: string | null;
  contract_date: string | null;
}

export interface DeviceInfo {
  com_id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  install_address: string;
  floor_no: number;
  install_position: string;
  smoke_density: number;
  temp: number;
  humidity: number;
  co: number;
  tempRise: number;
  evemt_time: string;
}

export interface CircleData {
  center: { lat: number; lng: number };
  radius: number;
  count: number;
  fillColor: string;
  strokeColor: string;
  code: string;
  name: string;
}

export interface CircleInstance extends CircleData {
  mapObject?: any;
  overlay?: any;
  listener?: any;
}

export interface EventData {
  event_id: number;
  event_time: string | null;
  client_code: string | null;
  contract_code: string | null;
  customer_name: string | null;
  event_type: number;
  event_code: number;
  event_name: string | null;
  sub_code: number;
  sub_name: string | null;
  event_kind: number;
  re_cancel: number;
  other_event: number;
  sms_flag: number;
  device_type: number;
  device_name: string | null;
  event_reason: string | null;
  floor_no: number;
  com_id: string | null;
  device_id: string | null;
  install_address: string | null;
  event_msg: string | null;
  city_code: string | null;
  district_code: string | null;
  smoke_density: number;
  temp: number;
  humidity: number;
  co: number;
  temp_rise: number;
}

export interface FloorInfo {
  client_code: string | null;
  contract_code: string | null;
  floor_no: number | null;
  floor_name: string | null;
  file_path: string | null;
}
