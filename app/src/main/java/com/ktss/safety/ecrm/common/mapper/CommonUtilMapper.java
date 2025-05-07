package com.ktss.safety.ecrm.common.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommonUtilMapper {
    List<Map<String, Object>> getResionList(Map<String, Object> paramMap);

    List<Map<String, Object>> getServiceType(Map<String, Object> paramMap);

    List<Map<String, Object>> getBuildingType(Map<String, Object> paramMap);

}
