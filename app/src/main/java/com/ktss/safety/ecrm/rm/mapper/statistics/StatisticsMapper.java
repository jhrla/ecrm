package com.ktss.safety.ecrm.rm.mapper.statistics;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface StatisticsMapper {
    List<Map<String, Object>> getPeriodicReport(Map<String, Object> paramMap);

    int getPeriodicReportCount(Map<String, Object> paramMap);

    List<Map<String, Object>> getPeriodicReportExcel(Map<String, Object> paramMap);
}
