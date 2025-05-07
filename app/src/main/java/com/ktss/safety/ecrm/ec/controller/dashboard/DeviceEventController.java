package com.ktss.safety.ecrm.ec.controller.dashboard;

import java.util.Map;
import java.net.http.HttpClient;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ktss.safety.ecrm.ec.service.dashboard.DeviceEventService;

@RestController
public class DeviceEventController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private DeviceEventService deviceApiService;

    private final SimpMessagingTemplate messagingTemplate;

    public DeviceEventController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // 공통 응답 생성 메서드
    private ResponseEntity<Map<String, String>> createResponse(String code, String message) {
        Map<String, String> result = new HashMap<>();
        result.put("result_code", code);
        result.put("result_msg", message);
        return ResponseEntity.ok(result);
    }

    // 공통 에러 처리 메서드
    private ResponseEntity<Map<String, String>> handleError(Exception e) {
        logger.error("Error processing request", e);
        return createResponse("502", "처리중 오류가 발생하였습니다");
    }

    // 이벤트 메시지 전송 메서드
    private void sendEventMessage(String destination, Map<String, Object> data) {
        messagingTemplate.convertAndSend(destination, data);
        logger.info("Message sent successfully to {}", destination);
    }

    @PostMapping("/api/deviceAlive")
    public ResponseEntity<String> deviceAlive(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok("Receive Ok!!!");
    }

    @PostMapping("/api/deviceInit")
    public ResponseEntity<Map<String, String>> deviceInit(@RequestBody Map<String, Object> paramMap) {
        Map<String, String> result = new HashMap<String, String>();
        result.put("result_code", "0");
        result.put("result_msg", "정상처리");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/api/deviceStatusInfo")
    public ResponseEntity<Map<String, String>> deviceInfo(@RequestBody Map<String, Object> paramMap) {
        int resultCode = deviceApiService.setDeviceStatusData(paramMap);
        if (resultCode == 505) {
            return createResponse("505", "데이터가 존재하지 않습니다");
        } else if (resultCode == 0) {
            return createResponse("502", "처리중 오류가 발생하였습니다");
        } else {
            return createResponse("0", "정상처리 되었습니다");
        }
    }

    @PostMapping("/api/eventMessages")
    public ResponseEntity<Map<String, String>> eventMessages(@RequestBody Map<String, Object> paramMap) {
        String com_id = null;
        String device_id = null;
        try {
            logger.info("Received message: {}", paramMap);
            logger.info("Message size: {}", paramMap.toString().getBytes().length);

            // 이벤트 DB저장
            String event_time = String.valueOf(paramMap.get("MeasuredTime"));
            com_id = String.valueOf(paramMap.get("ComId"));
            Map<String, Object> eventInfo = (Map<String, Object>) paramMap.get("EventInfo");
            Map<String, Object> deviceTempInfo = new HashMap<String, Object>();

            int event_kind = (int) eventInfo.get("EventKind");
            String other_event = String.valueOf(eventInfo.get("OtherEvent"));
            device_id = getDeviceId(String.valueOf(paramMap.get("DeviceId")));
            String event_name = getEventName(
                    String.valueOf(paramMap.get("DeviceId")), eventInfo.get("EventName").toString());

            Map<String, Object> eventData = new HashMap<String, Object>();

            eventData.put("com_id", com_id);
            eventData.put("device_id", device_id);
            eventData.put("device_name", eventInfo.get("DeviceName"));
            eventData.put("event_time", event_time);
            eventData.put("event_code", eventInfo.get("EventCode"));
            eventData.put("event_name", event_name);
            eventData.put("sub_code", eventInfo.get("SubCode"));
            eventData.put("sub_name", eventInfo.get("SubName"));
            eventData.put("event_kind", event_kind);
            eventData.put("event_type", getEventType(String.valueOf(event_kind)));
            eventData.put("event_error", eventInfo.get("EventError"));
            eventData.put("re_cancel", eventInfo.get("ReCancel"));
            eventData.put("other_event", other_event);
            eventData.put("sms_flag", eventInfo.get("SmsFlag"));
            eventData.put("device_type", eventInfo.get("DeviceType"));
            eventData.put("event_reason", eventInfo.get("EventReason"));

            if (eventInfo.containsKey("DeviceInfo")) {
                deviceTempInfo = (Map<String, Object>) eventInfo.get("DeviceInfo");
                eventData.put("smoke_density", deviceTempInfo.get("SmokeDensity"));
                eventData.put("temp", deviceTempInfo.get("Temp"));
                eventData.put("humidity", deviceTempInfo.get("Humidity"));
                eventData.put("co", deviceTempInfo.get("Co"));
                eventData.put("temp_rise", deviceTempInfo.get("TempRise"));
            } else {
                eventData.put("smoke_density", null);
                eventData.put("temp", null);
                eventData.put("humidity", null);
                eventData.put("co", null);
                eventData.put("temp_rise", null);
            }
            Map<String, String> result_code = new HashMap<String, String>();

            // event_kind가 1(경보) 또는 2(주의보)일 때만 중복 체크
            if (event_kind != 0) {
                int dupEventData = deviceApiService.checkDupEventData(eventData);
                if (event_kind == 1 || event_kind == 2) {
                    if (dupEventData > 0) {
                        result_code.put("result_code", "503");
                        result_code.put("result_msg", "중복된 이벤트 데이터가 있습니다");
                        return ResponseEntity.ok(result_code);
                    }
                } else if (event_kind == 3 || event_kind == 4) {
                    if (dupEventData == 0) {
                        result_code.put("result_code", "504");
                        result_code.put("result_msg", "이미 해제된 이벤트 입니다.");
                        return ResponseEntity.ok(result_code);
                    }
                }
            }

            int result = deviceApiService.getEventMessagesProcess(eventData);
            if (result == 0) {
                if (!other_event.equals("1")) {
                    if (event_kind == 1 || event_kind == 2) {
                        messagingTemplate.convertAndSend("/event/messages", eventData);
                    } else if (event_kind == 3 || event_kind == 4) {
                        messagingTemplate.convertAndSend("/event/clearMessage", eventData);
                    }
                }
                result_code.put("result_code", "0");
                result_code.put("result_msg", "정상처리 되었습니다");
                return ResponseEntity.ok(result_code);
            } else {
                result_code.put("result_code", "502");
                result_code.put("result_msg", "처리중 오류가 발생하였습니다");
                return ResponseEntity.ok(result_code);
            }
        } catch (Exception e) {
            logger.error("Error sending message", e);
            Map<String, String> result = new HashMap<String, String>();
            result.put("result_code", "502");
            result.put("result_msg", "처리중 오류가 발생하였습니다..");
            result.put("com_id", com_id);
            result.put("device_id", device_id);
            return ResponseEntity.ok(result);
        }
    }

    @PostMapping({ "/api/eventRequestComplate", "/api/eventResponseComplate" })
    public ResponseEntity<Map<String, String>> handleEventComplete(@RequestBody Map<String, Object> paramMap) {
        try {
            logger.info("Received message: {}", paramMap);
            sendEventMessage("/event/clearMessage", paramMap);

            return createResponse("0", "정상처리 되었습니다");
        } catch (Exception e) {
            return handleError(e);
        }
    }

    @PostMapping("/api/forceRecover")
    public ResponseEntity<String> forceRecover(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(deviceApiService.forceRecover(paramMap));
    }

    private String getEventName(String device_id, String event_name) {
        String device_port = null;
        if (device_id.contains("I")) {
            device_port = " - 입력 " + device_id.split("-")[1].replaceAll("I", "") + "번 포트";
            event_name = event_name + device_port;
        } else if (device_id.contains("O")) {
            device_port = " - 출력 " + device_id.split("-")[1].replaceAll("O", "") + "번 포트";
            event_name = event_name + device_port;
        }
        return event_name;
    }

    private String getDeviceId(String device_id) {
        if (device_id.contains("I") || device_id.contains("O")) {
            String[] device_id_split = device_id.split("-");
            String device_id_str = "";
            for (int i = 0; i < device_id_split.length - 1; i++) {
                if (i == 0) {
                    device_id_str += device_id_split[i];
                } else {
                    device_id_str += "-" + device_id_split[i];
                }
            }
            return device_id_str;
        } else {
            return device_id;
        }
    }

    private String getEventType(String event_kind) {
        if (event_kind.equals("1")) {
            return "경보";
        } else if (event_kind.equals("2")) {
            return "주의보";
        }
        return "";
    }

}
