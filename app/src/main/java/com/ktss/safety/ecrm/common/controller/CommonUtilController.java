package com.ktss.safety.ecrm.common.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ktss.safety.ecrm.common.service.CommonUtilService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CommonUtilController {

    private static final Logger logger = LoggerFactory.getLogger(CommonUtilController.class);

    private final CommonUtilService commonUtilService;

    @PostMapping("/api/regions")
    public ResponseEntity<List<Map<String, Object>>> getClientAll(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(commonUtilService.getResionList(paramMap));
    }

    @PostMapping("/api/serviceType")
    public ResponseEntity<List<Map<String, Object>>> getServiceType(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(commonUtilService.getServiceType(paramMap));
    }

    @PostMapping("/api/buildingType")
    public ResponseEntity<List<Map<String, Object>>> getBuildType(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(commonUtilService.getBuildType(paramMap));
    }

}
