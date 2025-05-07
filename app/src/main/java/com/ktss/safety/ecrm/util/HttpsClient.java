package com.ktss.safety.ecrm.util;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import javax.net.ssl.HttpsURLConnection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class HttpsClient {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    public String sendAddress(String address) {
        String gpsPosition = null;
        try {
            // URL 파라미터를 변수로 설정
            String key = "42AA31F6-B11C-3A4E-9521-D6B4CDC57546"; // 자신의 API Key

            // 주소를 URL 인코딩
            String encodedAddress = URLEncoder.encode(address, "UTF-8");

            // 동적으로 URL 생성
            StringBuffer urlString = new StringBuffer();

            urlString.append("https://api.vworld.kr/req/address?service=address")
                    .append("&request=getCoord")
                    .append("&key=")
                    .append(key)
                    .append("&format=json")
                    .append("&address=")
                    .append(encodedAddress)
                    .append("&type=ROAD");
            logger.debug("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@sendAddress");
            logger.debug(urlString.toString());
            logger.debug("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@sendAddress");
            // URL 객체 생성
            URL url = new URL(urlString.toString());
            HttpsURLConnection con = (HttpsURLConnection) url.openConnection();

            // GET 메소드 설정
            con.setRequestMethod("GET");

            // 요청 헤더 설정
            con.setRequestProperty("Accept", "application/json");

            // 응답 코드 확인
            int responseCode = con.getResponseCode();
            System.out
                    .println("GET Response Code : " + responseCode);

            // 응답이 성공적이면 응답 데이터를 읽음
            if (responseCode == HttpURLConnection.HTTP_OK) { // HTTP_OK = 200
                BufferedReader in = new BufferedReader(
                        new InputStreamReader(con.getInputStream(), "UTF-8"));
                String inputLine;
                StringBuffer response = new StringBuffer();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                Gson gson = new Gson();
                // JSON 파싱
                JsonObject jsonObj = JsonParser.parseString(response.toString()).getAsJsonObject();
                logger.debug(jsonObj.toString());

                String status = jsonObj.getAsJsonObject("response")
                        .get("status")
                        .getAsString();

                if ("OK".equals(status)) {
                    try {
                        JsonObject point = jsonObj.getAsJsonObject("response")
                                .getAsJsonObject("result")
                                .getAsJsonObject("point");

                        // 새로운 JsonObject 생성
                        JsonObject gpsPoint = new JsonObject();
                        // y값을 lat로, x값을 lng로 매핑
                        gpsPoint.addProperty("lat", point.get("y").getAsFloat());
                        gpsPoint.addProperty("lng", point.get("x").getAsFloat());

                        gpsPosition = gson.toJson(gpsPoint);
                        System.out.println(gpsPosition);
                        return gpsPosition; // 성공 시 좌표 반환
                    } catch (Exception e) {
                        logger.error("Point 객체를 찾을 수 없습니다: " + e.getMessage());
                        return null;
                    }
                }

                return null; // status가 "OK"가 아닐 경우 null 반환

            } else {
                System.out
                        .println("GET request failed.");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return gpsPosition;
    }

    public JsonObject sendDeviceInfo(String url, JsonObject jobj) {
        JsonObject result = null;
        try {
            // 동적으로 URL 생성
            StringBuffer urlString = new StringBuffer();

            urlString.append(url);

            // URL 객체 생성
            URL reqUrl = new URL(urlString.toString());
            HttpURLConnection con = (HttpURLConnection) reqUrl.openConnection();

            // GET 메소드 설정
            con.setDoOutput(true);
            con.setRequestMethod("GET");

            // 요청 헤더 설정
            con.setRequestProperty("Accept", "application/json");
            OutputStreamWriter osw = new OutputStreamWriter(con.getOutputStream(), "UTF-8");
            osw.write(new Gson().toJson(jobj));
            osw.flush();

            // 응답 코드 확인
            int responseCode = con.getResponseCode();
            System.out.println("GET Response Code : " + responseCode);

            // 응답이 성공적이면 응답 데이터를 읽음
            if (responseCode == HttpURLConnection.HTTP_OK) { // HTTP_OK = 200
                BufferedReader in = new BufferedReader(
                        new InputStreamReader(con.getInputStream(), "UTF-8"));
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    String input = inputLine;
                    response.append(input.replace("\\\"", "\""));
                }
                in.close();

                // Type type = new TypeToken<Map<String, Object>>() {
                // }.getType();
                // 문자열이 따옴표로 시작하고 끝나는 경우 제거
                String jsonString = null;
                if (response.toString().startsWith("\"") && response.toString().endsWith("\"")) {
                    jsonString = response.toString().substring(1, response.toString().length() - 1);
                }
                logger.debug("response: {}", response.toString());
                logger.debug("jsonString: {}", jsonString);

                Gson gson = new Gson();
                // JSON 파싱
                // 바로 파싱 시도
                result = gson.fromJson(jsonString, JsonObject.class);

            } else {
                System.out
                        .println("GET request failed.");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    public void sendSms(Map<String, Object> smsMsg) {
        String sms_url = "https://apis.aligo.in/send/"; // 전송요청 URL

        String totalTel = String.join(",",
                smsMsg.get("emergency_tel1") != null ? (String)smsMsg.get("emergency_tel1") : "",
                smsMsg.get("emergency_tel2") != null ? (String)smsMsg.get("emergency_tel2") : "",
                smsMsg.get("emergency_tel3") != null ? (String)smsMsg.get("emergency_tel3") : ""
        );

        Map<String, String> sms = new HashMap<>();
        sms.put("user_id", "ktss2402"); // SMS 아이디
        sms.put("key", "7yuejg6xwqg161vn7s0k13okayuvfj6x"); // 인증키

        StringBuilder sBuilder = new StringBuilder();
        sBuilder.append("[KTSS]\n")
                .append("- 화재경보\n")
                .append("- ")
                .append(smsMsg.get("event_time"))
                .append("\n")
                .append("- ")
                .append(smsMsg.get("event_msg").toString().replaceAll("\\s+",
                        ""))
                .append("\n");

        // 전송 정보 추가
        sms.put("msg", sBuilder.toString()); // 메시지 내용
        sms.put("receiver", totalTel); // 수신번호
        sms.put("sender", "16602402"); // 발신번호
        // sms.put("title", "[KTSS] 종합안전관리플랫폼 알림"); // LMS, MMS 제목

        try {
            // URL 객체 생성
            URL reqUrl = new URL(sms_url);
            HttpURLConnection con = (HttpURLConnection) reqUrl.openConnection();

            // POST 메소드 및 헤더 설정
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            con.setDoOutput(true);

            // 파라미터 문자열 생성
            StringBuilder postData = new StringBuilder();
            for (Map.Entry<String, String> param : sms.entrySet()) {
                if (postData.length() != 0)
                    postData.append('&');
                postData.append(URLEncoder.encode(param.getKey(), "UTF-8"));
                postData.append('=');
                postData.append(URLEncoder.encode(param.getValue(), "UTF-8"));
            }

            // 전송 데이터 작성
            try (DataOutputStream dos = new DataOutputStream(con.getOutputStream())) {
                dos.writeBytes(postData.toString());
                dos.flush();
            }

            // 응답 코드 확인
            int responseCode = con.getResponseCode();
            System.out.println("POST Response Code : " + responseCode);

            // 응답이 성공적이면 응답 데이터를 읽음
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream(), "UTF-8"));
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                System.out.println("Response: " + response.toString());
            } else {
                System.out.println("POST request failed.");
            }

        } catch (Exception exception) {
            exception.printStackTrace();
        }

    }

    // public static void main(String[] args) {
    // new HttpsClient().sendSms(null);
    // }
}
