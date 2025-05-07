package com.ktss.safety.ecrm.common.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.ktss.safety.ecrm.common.mapper.CommonUtilMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommonUtilService {

    private static final Logger logger = LoggerFactory.getLogger(CommonUtilService.class);

    private final CommonUtilMapper commonUtilMapper;

    public List<Map<String, Object>> getResionList(Map<String, Object> paramMap) {
        return (List<Map<String, Object>>) commonUtilMapper.getResionList(paramMap);
    }

    public List<Map<String, Object>> getServiceType(Map<String, Object> paramMap) {
        return (List<Map<String, Object>>) commonUtilMapper.getServiceType(paramMap);
    }

    public List<Map<String, Object>> getBuildType(Map<String, Object> paramMap) {
        return (List<Map<String, Object>>) commonUtilMapper.getBuildingType(paramMap);
    }

}
