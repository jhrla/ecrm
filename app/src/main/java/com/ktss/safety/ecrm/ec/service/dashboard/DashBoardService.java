package com.ktss.safety.ecrm.ec.service.dashboard;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.google.gson.JsonObject;
import com.ktss.safety.ecrm.ec.mapper.dashboard.DashBoardMapper;
import com.ktss.safety.ecrm.util.HttpsClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashBoardService {
    private static final Logger logger = LoggerFactory.getLogger(DashBoardService.class);

    private final DashBoardMapper dashBoardMapper;

    public Map<String, Object> getAreaList(Map<String, Object> areaInfo) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, String>> customerData = new ArrayList<>();
        List<Map<String, Object>> cityData = dashBoardMapper.getAreaList(areaInfo);
        if (null != cityData && cityData.size() > 0) {
            for (Map<String, Object> customer : cityData) {
                Map<String, String> temp = new HashMap<String, String>();
                temp.put("code", String.valueOf(customer.get("code")));
                temp.put("name", String.valueOf(customer.get("name")));
                temp.put("center", String.valueOf(customer.get("center")));
                temp.put("count", String.valueOf(customer.get("count")));
                customerData.add(temp);
            }
            result.put("cityList", cityData);
            result.put("customerList", customerData);
        }
        return result;
    }

    public List<Map<String, Object>> getAreaCustomerList(Map<String, Object> areaInfo) {
        return dashBoardMapper.getCustomerList(areaInfo);
    }

    public Map<String, Object> getCustomerInfo(Map<String, Object> customerInfo) {
        Map<String, Object> result = new HashMap<>();
        result.put("customerInfo", dashBoardMapper.getCustomerInfo(customerInfo));
        result.put("floorList", dashBoardMapper.getFloorList(customerInfo));
        result.put("deviceList", dashBoardMapper.getDeviceList(customerInfo));
        return result;
    }

    public String sendRecoverRequest(Map<String, Object> paramMap) {
        String result = "";
        try {
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            Date currentTime = new Date();

            logger.debug("paramMap : {}", paramMap.toString());

            // eventList에서 첫 번째 이벤트 데이터 가져오기
            List<Map<String, Object>> eventList = (List<Map<String, Object>>) paramMap.get("eventList");
            Map<String, Object> eventData = null;
            for (Map<String, Object> event : eventList) {
                logger.debug("event : {}", event.toString());
                logger.debug("event : {}", Integer.parseInt(event.get("event_code").toString()) == 53);
                if (Integer.parseInt(event.get("event_code").toString()) == 53) {
                    eventData = event;
                    break;
                }
            }

            logger.debug("eventData : {}", eventData.toString());

            if (eventData != null) {
                JsonObject eventMap = new JsonObject();
                JsonObject eventInfo = new JsonObject();
                JsonObject deviceInfo = new JsonObject();

                // 기본 정보 세팅
                eventMap.addProperty("MeasuredTime", formatter.format(currentTime));
                eventMap.addProperty("ComId", String.valueOf(eventData.get("com_id")));
                eventMap.addProperty("DeviceId", String.valueOf(eventData.get("device_id")));
                eventMap.addProperty("EventType", "191");

                // EventInfo 세팅
                eventInfo.addProperty("EventCode",
                        String.valueOf(eventData.get("event_code")));
                eventInfo.addProperty("EventName",
                        String.valueOf(eventData.get("event_name")));
                eventInfo.addProperty("SubCode", "3"); // 복구 코드
                eventInfo.addProperty("SubName", "복구");
                eventInfo.addProperty("EventKind", "3"); // 복구 종류
                eventInfo.addProperty("EventError",
                        String.valueOf(eventData.get("event_error")));
                eventInfo.addProperty("ReCancel",
                        String.valueOf(eventData.get("re_cancel")));
                eventInfo.addProperty("OtherEvent",
                        String.valueOf(eventData.get("other_event")));
                eventInfo.addProperty("SmsFlag", String.valueOf(eventData.get("sms_flag")));
                eventInfo.addProperty("DeviceType", String.valueOf(eventData.get("device_type")));
                eventInfo.addProperty("DeviceName", String.valueOf(eventData.get("device_name")));
                eventInfo.addProperty("EventReason", String.valueOf(eventData.get("event_reason")));

                // DeviceInfo 세팅
                deviceInfo.addProperty("SmokeDensity", String.valueOf(eventData.get("smoke_density")));
                deviceInfo.addProperty("Temp", String.valueOf(eventData.get("temp")));
                deviceInfo.addProperty("Humidity", String.valueOf(eventData.get("humidity")));
                deviceInfo.addProperty("Co", String.valueOf(eventData.get("co")));
                deviceInfo.addProperty("TempRise", String.valueOf(eventData.get("temp_rise")));

                // 객체 조립
                eventInfo.add("DeviceInfo", deviceInfo);
                eventMap.add("EventInfo", eventInfo);

                HttpsClient https = new HttpsClient();
                JsonObject resultObj = https.sendDeviceInfo("http://211.233.16.207:33311/control", eventMap);
                result = "전송되었습니다.";
            }
        } catch (Exception e) {
            logger.error("sendRecorverRequest 오류", e);
            e.printStackTrace();
        }
        return result;
    }

    public int sendConfirmRequest(Map<String, Object> paramMap) {
        int result = 0;
        List<Map<String, Object>> eventList = (List<Map<String, Object>>) paramMap.get("eventList");
        for (Map<String, Object> event : eventList) {
            dashBoardMapper.sendConfirmRequest(event);
            result++;
        }
        return result;
    }

    public List<Map<String, Object>> getDashBoardEventList() {
        return dashBoardMapper.getDashBoardEventList();
    }

    public String sendEventSms(Map<String, Object> paramMap) {
        HttpsClient https = new HttpsClient();
        logger.debug(paramMap.toString());
        https.sendSms(paramMap);
        return "발송완료";
    }

}
