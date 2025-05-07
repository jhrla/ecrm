package com.ktss.safety.ecrm.ec.mapper.dashboard;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DeviceEventMapper {

    Map<String, Object> getEvenvDetailInfo(Map<String, Object> paramMap);

    int setEvenvDetailInfo(Map<String, Object> paramMap);

    int setDeviceStatusInfo(Map<String, Object> paramMap);

    int updateEvenvDetailInfo(Map<String, Object> paramMap);

    int updateForceRecover(Map<String, Object> paramMap);

    int getDupEventData(Map<String, Object> paramMap);

    int setDeviceStatusData(Map<String, Object> paramMap);

    Map<String, Object> getDeviceInfo(Map<String, Object> paramMap);

    int maxLogSeq(Map<String, Object> paramMap);

    int sendSmsRequestTime(String event_id);
}
