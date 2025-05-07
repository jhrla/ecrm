package com.ktss.safety.ecrm.ec.service.dashboard;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.JsonObject;
import com.ktss.safety.ecrm.fcm.FcmService;
import com.ktss.safety.ecrm.util.HttpsClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ktss.safety.ecrm.ec.mapper.dashboard.DeviceEventMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DeviceEventService {
    private static final Logger logger = LoggerFactory.getLogger(DeviceEventService.class);

    private final DeviceEventMapper deviceMapper;

    private final FcmService fcmService;

    public Map<String, Object> getAllDeviceList(Map<String, Object> paramMap) {
        Map<String, Object> resultMap = new HashMap<String, Object>();

        return resultMap;
    }

    public int getEventMessagesProcess(Map<String, Object> eventData) {
        int result = 0;
        Map<String, Object> eventInfo = null;
        String sub_code = String.valueOf(eventData.get("sub_code"));
        int event_kind = (int) eventData.get("event_kind");
        String sms_flag = String.valueOf(eventData.get("sms_flag"));
        String other_event = String.valueOf(eventData.get("other_event"));

        Map<String, Object> deviceInfo = deviceMapper.getDeviceInfo(eventData);
        eventData.put("contract_code", deviceInfo.get("contract_code"));
        eventData.put("client_code", deviceInfo.get("client_code"));
        eventData.put("floor_no", deviceInfo.get("floor_no"));

        if (!sub_code.equals("0")) {
            if (event_kind == 0 || event_kind == 1 || event_kind == 2) {
                logger.debug("eventData insert : {}", eventData.toString());
                deviceMapper.setEvenvDetailInfo(eventData);
                eventInfo = deviceMapper.getEvenvDetailInfo(eventData);
                eventData.put("event_id", eventInfo.get("event_id"));
                eventData.put("event_msg", eventInfo.get("event_msg"));
                eventData.put("contract_code", eventInfo.get("contract_code"));
                eventData.put("client_code", eventInfo.get("client_code"));
                eventData.put("floor_no", eventInfo.get("floor_no"));
                eventData.put("city_code", eventInfo.get("city_code"));
                if(event_kind == 1){
                    fcmService.sendPushNotification(eventData);
                }
            } else {
                eventInfo = deviceMapper.getEvenvDetailInfo(eventData);
                eventData.put("event_id", eventInfo.get("event_id"));
                eventData.put("event_msg", eventInfo.get("event_msg"));
                eventData.put("contract_code", eventInfo.get("contract_code"));
                eventData.put("client_code", eventInfo.get("client_code"));
                eventData.put("floor_no", eventInfo.get("floor_no"));
                eventData.put("city_code", eventInfo.get("city_code"));
                logger.debug("eventData update : {}", eventData.toString());
                deviceMapper.updateEvenvDetailInfo(eventData);
            }
        } else {
            logger.debug("eventData insert : {}", eventData.toString());
            deviceMapper.setEvenvDetailInfo(eventData);
            eventInfo = deviceMapper.getEvenvDetailInfo(eventData);
            eventData.put("event_id", eventInfo.get("event_id"));
            eventData.put("event_msg", eventInfo.get("event_msg"));
            eventData.put("contract_code", eventInfo.get("contract_code"));
            eventData.put("client_code", eventInfo.get("client_code"));
            eventData.put("floor_no", eventInfo.get("floor_no"));
            eventData.put("city_code", eventInfo.get("city_code"));
            logger.debug("eventData update : {}", eventData.toString());
        }

        logger.debug("eventInfo : {}", eventInfo);

        if (!sms_flag.equals("0")) {
            if (eventInfo != null) {
                sendSms(sms_flag, String.valueOf(eventInfo.get("event_id")));
            }
        }

        return result;
    }

    public int checkDupEventData(Map<String, Object> paramMap) {
        return deviceMapper.getDupEventData(paramMap);
    }

    public int setDeviceStatusData(Map<String, Object> paramMap) {
        Map<String, Object> statusInfo = (Map<String, Object>) paramMap.get("StatusInfo");
        Map<String, Object> deviceInfo = (Map<String, Object>) statusInfo.get("DeviceInfo");
        Map<String, Object> deviceInputMap = new HashMap<String, Object>();

        deviceInputMap.put("com_id", paramMap.get("ComId"));
        deviceInputMap.put("device_id", statusInfo.get("DeviceId"));
        deviceInputMap.put("device_type", statusInfo.get("DeviceType"));
        deviceInputMap.put("smoke_density", deviceInfo.get("SmokeDensity"));
        deviceInputMap.put("fire_status", deviceInfo.get("FireStatus"));
        deviceInputMap.put("temp", deviceInfo.get("Temp"));
        deviceInputMap.put("humidity", deviceInfo.get("Humidity"));
        deviceInputMap.put("co", deviceInfo.get("Co"));
        deviceInputMap.put("temp_rise", deviceInfo.get("TempRise"));

        Map<String, Object> deviceMap = deviceMapper.getDeviceInfo(deviceInputMap);
        if (deviceMap != null) {
            deviceInputMap.put("client_code", deviceMap.get("client_code"));
            deviceInputMap.put("contract_code", deviceMap.get("contract_code"));
            deviceInputMap.put("floor_no", deviceMap.get("floor_no"));

            int log_seq = deviceMapper.maxLogSeq(deviceInputMap);
            deviceInputMap.put("log_seq", log_seq);
            return deviceMapper.setDeviceStatusData(deviceInputMap);
        } else {
            return 505;
        }
    }

    private void sendSms(String sms_flag, String event_id) {
        // HttpsClient https = new HttpsClient();
        if (sms_flag.equals("1")) {

        } else if (sms_flag.equals("2")) {

        } else if (sms_flag.equals("3")) {
        }
        // https.sendSms(paramMap);
        deviceMapper.sendSmsRequestTime(event_id);
    }

    public String sendEventSms(Map<String, Object> paramMap) {

        logger.debug(paramMap.toString());

        return "발송완료";
    }

    public String forceRecover(Map<String, Object> paramMap) {
        String result = "";
        try {
            deviceMapper.updateForceRecover(paramMap);
            result = "처리되었습니다.";
        } catch (Exception e) {
            logger.error("forceRecoverRequest 오류", e);
            e.printStackTrace();
        }
        return result;
    }

}
