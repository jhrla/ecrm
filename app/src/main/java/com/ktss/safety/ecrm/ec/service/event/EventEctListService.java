package com.ktss.safety.ecrm.ec.service.event;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ktss.safety.ecrm.ec.mapper.event.EventEctMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventEctListService {
    private static final Logger logger = LoggerFactory.getLogger(EventEctListService.class);

    private final EventEctMapper eventEctMapper;

    public Map<String, Object> getEventEtcList(Map<String, Object> paramMap) {

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

        List<Map<String, Object>> resultList = eventEctMapper.getEventEtcList(paramMap);

        int count = eventEctMapper.getEventEtcListCount(paramMap);
        int totalPages = (int) Math.ceil((double) count / pageSize);

        // Add results to the resultMap
        resultMap.put("eventEtcList", resultList);
        resultMap.put("totalPages", totalPages);
        resultMap.put("totalCount", count);

        return resultMap;
    }

    public List<Map<String, Object>> getEventEtcListExcel(Map<String, Object> paramMap) {
        return eventEctMapper.getEventEtcListExcel(paramMap);
    }
}
