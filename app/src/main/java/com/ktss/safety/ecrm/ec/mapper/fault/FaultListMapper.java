package com.ktss.safety.ecrm.ec.mapper.fault;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FaultListMapper {

    List<Map<String, Object>> getFaultList(Map<String, Object> paramMap);

    int getFaultListCount(Map<String, Object> paramMap);

    List<Map<String, Object>> getFaultListExcel(Map<String, Object> paramMap);

    Map<String, Object> getFaultRecoveryInfo(Map<String, Object> paramMap);

    int saveFaultAction(Map<String, Object> paramMap);

    int updateFaultAction(Map<String, Object> paramMap);
}
