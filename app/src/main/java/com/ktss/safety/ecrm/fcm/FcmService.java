package com.ktss.safety.ecrm.fcm;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FcmService {

    private final FcmMapper fcmMapper;

    public void upsertDeviceFcmToken(Map<String, Object> paramMap) {
        fcmMapper.upsertDeviceFcmToken(paramMap);
    }

    public void deleteDeviceFcmToken(Map<String, Object> paramMap) {
        fcmMapper.deleteDeviceFcmToken(paramMap);
    }

    public Map<String, Object> getFcmUseYn(Map<String, Object> paramMap) {
        return fcmMapper.getFcmUseYn(paramMap);
    }

    public void sendPushNotification(Map<String, Object> paramMap) {

        String title = "화재경보 발생";
        String body = (String) paramMap.get("event_msg");
        String contract_code = (String) paramMap.getOrDefault("contract_code", "");
        if (contract_code.isEmpty()) {
            System.err.println("contract_code가 누락되었습니다.");
            return;
        }
        List<Map<String, Object>> tokens = fcmMapper.getFcmTokensByContractCode(contract_code);
        for (Map<String, Object> tokenMap : tokens) {
            String token = (String) tokenMap.get("fcm_token");
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build()
                    )
                    .setAndroidConfig(AndroidConfig.builder()
                            .setNotification(AndroidNotification.builder()
                                    .setChannelId("default")
                                    .setSound("ktss_alarm") // 여기서 사운드 지정
                                    .build()
                            )
                            .build()
                    )
                    .putData("sound", "ktss_alarm")
                    .putData("customKey", "customValue")
                    .build();
            try {
                String response = FirebaseMessaging.getInstance().send(message);
                System.out.println("푸시 메시지 전송 성공: " + response);
            } catch (Exception e) {
                System.err.println("푸시 메시지 전송 실패: " + e.getMessage());
            }
        }
    }
}