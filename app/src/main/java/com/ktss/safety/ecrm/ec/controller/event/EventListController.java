package com.ktss.safety.ecrm.ec.controller.event;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ktss.safety.ecrm.ec.service.event.EventListService;
import com.ktss.safety.ecrm.util.ExcelDownUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class EventListController {
    private static final Logger logger = LoggerFactory.getLogger(EventListController.class);

    @Autowired
    private EventListService eventListService;

    @GetMapping("/api/downloadEventList")
    public ResponseEntity<byte[]> downloadEventList(@RequestParam Map<String, Object> params,
            HttpServletRequest request) {
        try {
            List<Map<String, Object>> eventList = eventListService.getEventListExcel(params);
            String fileName = "이벤트목록";

            // 로그 추가
            logger.debug("데이터 크기: " + (eventList != null ? eventList.size() : 0));

            String[] headers = {
                    "서비스", "등급", "계약번호", "고객명",
                    "발생위치", "장비", "장치 ID", "발생 시간",
                    "이벤트 구분", "SMS 발송 시간", "조치 시간", "복구 시간"
            };

            List<String> fields = Arrays.asList(
                    "service_type", "event_kind", "contract_code", "customer_name",
                    "event_msg", "device_name", "device_id", "event_time",
                    "event_name", "sms_send_time", "recover_action_time", "recover_time");

            ResponseEntity<byte[]> excelFile = ExcelDownUtil.createExcelFile(fileName, eventList, headers, fields);

            // 응답 상태 확인
            if (excelFile.getStatusCode() != HttpStatus.OK) {
                logger.error("엑셀 파일 생성 실패: " + excelFile.getStatusCode());
                return excelFile;
            }

            String browser = request.getHeader("User-Agent");
            String encodedFileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");

            return ResponseEntity.ok()
                    .headers(excelFile.getHeaders())
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .header("Content-Disposition", "attachment; filename=\"" + encodedFileName + ".xlsx\"")
                    .body(excelFile.getBody());

        } catch (Exception e) {
            logger.error("엑셀 다운로드 중 오류 발생: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/api/getEventList")
    public ResponseEntity<Map<String, Object>> getEventList(@RequestBody Map<String, Object> paramMap) {
        return ResponseEntity.ok(eventListService.getEventList(paramMap));
    }
}
