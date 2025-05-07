package com.ktss.safety.ecrm.ec.mapper.event;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EventEctMapper {

    List<Map<String, Object>> getEventEtcList(Map<String, Object> paramMap);

    List<Map<String, Object>> getEventEtcListExcel(Map<String, Object> paramMap);

    int getEventEtcListCount(Map<String, Object> paramMap);
}
