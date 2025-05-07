package com.ktss.safety.ecrm.rm.mapper.device;

import org.apache.ibatis.annotations.Mapper;

import java.util.Map;
import java.util.List;

@Mapper
public interface DeviceApiMapper {
    List<Map<String, Object>> getAllDeviceList(Map<String, Object> paramMap);

    int getAllDeviceListCount(Map<String, Object> paramMap);
}
