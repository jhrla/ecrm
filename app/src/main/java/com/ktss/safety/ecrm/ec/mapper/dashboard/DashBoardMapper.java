package com.ktss.safety.ecrm.ec.mapper.dashboard;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DashBoardMapper {
    List<Map<String, Object>> getAreaList(Map<String, Object> areaInfo);

    List<Map<String, Object>> getCustomerList(Map<String, Object> areaInfo);

    List<Map<String, Object>> getDeviceList(Map<String, Object> areaInfo);

    List<Map<String, Object>> getFloorList(Map<String, Object> areaInfo);

    List<Map<String, Object>> getDashBoardEventList();

    Map<String, Object> getCustomerInfo(Map<String, Object> areaInfo);

    int sendConfirmRequest(Map<String, Object> paramMap);
}
