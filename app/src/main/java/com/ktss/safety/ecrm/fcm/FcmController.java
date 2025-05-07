package com.ktss.safety.ecrm.fcm;


import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FcmController {
    private static final Logger logger = LoggerFactory.getLogger(FcmController.class);

    @Autowired
    private FcmService fcmService;

    @PostMapping("/api/upsertDeviceFcmToken")
    public ResponseEntity<?> upsertDeviceFcmToken(@RequestBody Map<String, Object> paramMap) {
        fcmService.upsertDeviceFcmToken(paramMap);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/deleteDeviceFcmToken")
    public ResponseEntity<?> deleteDeviceFcmToken(@RequestBody Map<String, Object> paramMap) {
        fcmService.deleteDeviceFcmToken(paramMap);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/getFcmUseYn")
    public ResponseEntity<Map<String, Object>> getFcmUseYn(@RequestBody Map<String, Object> paramMap) {
        Map<String, Object> result = fcmService.getFcmUseYn(paramMap);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/api/sendTest")
    public String sendNotification(@RequestBody Map<String, Object> paramMap) {
        fcmService.sendPushNotification(paramMap);
        return "푸시 전송 완료";
    }
}
