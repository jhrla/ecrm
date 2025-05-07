package com.ktss.safety.ecrm.rm.service.statistics;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ktss.safety.ecrm.rm.mapper.statistics.StatisticsMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final StatisticsMapper statisticsMapper;

    public Map<String, Object> getPeriodicReport(Map<String, Object> paramMap) {
        Map<String, Object> resultMap = new HashMap<String, Object>();

        // 안전한 타입 캐스팅을 위한 처리
        int page = 1; // 기본값 설정
        int pageSize = 10; // 기본값 설정

        if (paramMap.get("page") instanceof Integer) {
            page = (Integer) paramMap.get("page");
        } else if (paramMap.get("page") instanceof String) {
            page = Integer.parseInt((String) paramMap.get("page"));
        }

        if (paramMap.get("pageSize") instanceof Integer) {
            pageSize = (Integer) paramMap.get("pageSize");
        } else if (paramMap.get("pageSize") instanceof String) {
            pageSize = Integer.parseInt((String) paramMap.get("pageSize"));
        }

        int offset = (page - 1) * pageSize;

        paramMap.put("offset", offset);
        paramMap.put("pageSize", pageSize);

        List<Map<String, Object>> resultList = statisticsMapper.getPeriodicReport(paramMap);

        int count = statisticsMapper.getPeriodicReportCount(paramMap);
        int totalPages = (int) Math.ceil((double) count / pageSize);

        // Add results to the resultMap
        resultMap.put("periodicReportList", resultList);
        resultMap.put("totalPages", totalPages);
        resultMap.put("totalCount", count);

        return resultMap;
    }

    public List<Map<String, Object>> getPeriodicReportExcel(Map<String, Object> paramMap) {
        return statisticsMapper.getPeriodicReportExcel(paramMap);
    }

}
