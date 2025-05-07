package com.ktss.safety.ecrm.ec.mapper.event;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EventListMapper {

    List<Map<String, Object>> getEventList(Map<String, Object> paramMap);

    List<Map<String, Object>> getEventListExcel(Map<String, Object> paramMap);

    int getEventListCount(Map<String, Object> paramMap);

}
