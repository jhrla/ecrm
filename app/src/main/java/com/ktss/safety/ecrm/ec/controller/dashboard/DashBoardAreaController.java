package com.ktss.safety.ecrm.ec.controller.dashboard;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ktss.safety.ecrm.ec.service.dashboard.DashBoardService;

@RestController
public class DashBoardAreaController {
    private static final Logger logger = LoggerFactory.getLogger(DashBoardAreaController.class);

    @Autowired
    private DashBoardService dashBoardService;

    @PostMapping("/api/getAreaList")
    public ResponseEntity<Map<String, Object>> getAreaList(@RequestBody Map<String, Object> areaInfo) {
        Map<String, Object> result = new HashMap<>();
        logger.debug(areaInfo.toString());
        if (!"customer".equals(areaInfo.get("level"))) {
            if ("land".equals(areaInfo.get("level"))) {
                areaInfo.put("level", "1");
                result = dashBoardService.getAreaList(areaInfo);
            } else if ("city".equals(areaInfo.get("level"))) {
                areaInfo.put("level", "2");
                result = dashBoardService.getAreaList(areaInfo);
            } else if ("district".equals(areaInfo.get("level"))) {
                result.put("customerList", dashBoardService.getAreaCustomerList(areaInfo));
            }
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/api/getAreaCustomerInfo")
    public ResponseEntity<Map<String, Object>> getAreaCustomer(@RequestBody Map<String, Object> areaInfo) {
        logger.debug(areaInfo.toString());
        return ResponseEntity.ok(dashBoardService.getCustomerInfo(areaInfo));
    }

    @PostMapping("/api/sendRecoverRequest")
    public ResponseEntity<String> sendRecoverRequest(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(dashBoardService.sendRecoverRequest(paramMap));
    }

    @PostMapping("/api/sendConfirmRequest")
    public ResponseEntity<Integer> sendConfirmRequest(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(dashBoardService.sendConfirmRequest(paramMap));
    }

    @PostMapping("/api/getDashBoardEventList")
    public ResponseEntity<List<Map<String, Object>>> getDashBoardEventList() {
        return ResponseEntity.ok(dashBoardService.getDashBoardEventList());
    }

    @PostMapping("/api/sendEventSms")
    public ResponseEntity<String> sendEventSms(@RequestBody Map<String, Object> paramMap) {
        dashBoardService.sendEventSms(paramMap);
        return ResponseEntity.ok("발송완료");
    }
}
