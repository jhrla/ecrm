package com.ktss.safety.ecrm.rm.mapper.device;

import org.apache.ibatis.annotations.Mapper;

import java.util.Map;
import java.util.List;

@Mapper
public interface DeviceMapper {
    List<Map<String, Object>> getFloorInfoList(Map<String, Object> paramMap);

    List<Map<String, Object>> getFloorFileList(Map<String, Object> paramMap);

    int getClientData(Map<String, Object> paramMap);

    List<Map<String, Object>> getDeviceInfo(Map<String, Object> paramMap);

    int setDeviceInfo(Map<String, Object> paramMap);

    int setDeviceQty(Map<String, Object> deviceQty);

    int setFloorUpload(Map<String, String> paramMap);

    int getFloorInfoListCount(Map<String, Object> paramMap);

    List<Map<String, String>> getFloorList(Map<String, Object> paramMap);

    List<Map<String, Object>> getFloorDeviceList(Map<String, Object> paramMap);

    int setDevicePosition(Map<String, Object> paramMap);

    Map<String, Object> getFloorFileInfo(Map<String, String> params);

    int updateFloorInfo(Map<String, String> floorData);

    List<Map<String, Object>> getDevicesList(Map<String, Object> paramMap);

    int getDevicesListCount(Map<String, Object> paramMap);

    int deleteFloorInfo(Map<String, String> paramMap);

    int deleteFloorDevices(Map<String, String> paramMap);

    int deleteDeviceLogs(Map<String, String> paramMap);

    int deleteEventLogs(Map<String, String> paramMap);
}
